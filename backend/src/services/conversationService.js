
// In-memory user session store: { contactNumber: { step, ... } }
const conversations = {};

// Conversation steps as constants (easier to debug & extend)
const STEPS = {
  ASK_PRODUCT: "ASK_PRODUCT",
  ASK_NAME: "ASK_NAME",
  ASK_REVIEW: "ASK_REVIEW",
};

// Config for safety & edge cases
const CONVERSATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MIN_REVIEW_LENGTH = 5;
const MAX_REVIEW_LENGTH = 1000;

// --------- Helpers ---------

function resetConversation(contactNumber) {
  delete conversations[contactNumber];
}

function startConversation(contactNumber) {
  conversations[contactNumber] = {
    step: STEPS.ASK_PRODUCT,
    productName: null,
    userName: null,
    productReview: null,
    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
  };
}

function getOrCreateConversation(contactNumber) {
  let convo = conversations[contactNumber];

  // If conversation exists but is stale, reset it
  if (convo && Date.now() - convo.lastUpdatedAt > CONVERSATION_TIMEOUT_MS) {
    resetConversation(contactNumber);
    convo = null;
  }

  if (!convo) {
    startConversation(contactNumber);
    convo = conversations[contactNumber];
  }

  return convo;
}

function updateConversation(contactNumber, updates) {
  if (!conversations[contactNumber]) {
    startConversation(contactNumber);
  }
  conversations[contactNumber] = {
    ...conversations[contactNumber],
    ...updates,
    lastUpdatedAt: Date.now(),
  };
}

// Normalize incoming text
function normalizeMessage(message) {
  return message?.trim() || "";
}

// Detect global commands (work at any step)
function detectCommand(textLower) {
  if (["hi", "hello", "start"].includes(textLower)) return "START";
  if (["reset", "restart"].includes(textLower)) return "RESET";
  if (["cancel", "stop"].includes(textLower)) return "CANCEL";
  if (["help", "?", "menu"].includes(textLower)) return "HELP";
  if (["status", "where am i", "progress"].includes(textLower)) return "STATUS";
  return null;
}

// Try to extract a product name from a sentence like "I'm gonna review Samsung TV"
function extractProductName(rawMessage) {
  let msg = rawMessage.trim();

  // Remove some common filler phrases
  msg = msg.replace(/i'm|im|i am|gonna|going to|want to|wanna|review|about|of|for/gi, " ");
  msg = msg.replace(/\s+/g, " ").trim();

  // If nothing left, fallback
  if (!msg) return rawMessage.trim();

  // If very long, take last 3 words as product name
  const parts = msg.split(" ");
  if (parts.length > 4) {
    return parts.slice(-3).join(" ");
  }

  return msg;
}

function extractName(raw) {
  let cleaned = raw
    .replace(/my name is|i am|i'm|im|this is|you can call me|call me|name is/gi, '')
    .trim();

  // Keep only letters, allow spaces, but don’t remove leading characters
  cleaned = cleaned.replace(/[^a-zA-Z\s]/g, '').trim();

  // Prevent accidental truncation
  if (cleaned.length < 2) return raw.trim(); // fallback to original
  
  // If input contains more than 3 words, take the first 2 (gives priority to start of sentence)
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length > 3) {
    return parts.slice(0, 2).join(' ');
  }

  return cleaned;
}



// Basic heuristic to detect if a message looks like a review instead of a name
function looksLikeReview(message) {
  const words = message.split(/\s+/);
  const hasSentencePunctuation = /[.!?]/.test(message);
  const hasRatingNumber = /\b\d(\.\d)?\/?10\b/.test(message); // e.g. 8/10, 9.5/10

  return words.length > 8 || hasSentencePunctuation || hasRatingNumber;
}

// --------- Main conversation function ---------

function processIncomingMessage(contactNumber, message) {
  const raw = normalizeMessage(message);
  const lower = raw.toLowerCase();

  // Handle empty input
  if (!raw) {
    return {
      reply: "I didn’t catch that 🤔 Could you please type your message again?",
    };
  }

  // Global commands (available any time)
  const command = detectCommand(lower);
  if (command === "HELP") {
    return {
      reply:
        "🆘 *Help menu*\n" +
        "- Type *Hi* to start a new review\n" +
        "- Type *reset* to restart the current review\n" +
        "- Type *cancel* to cancel this review\n" +
        "- Type *status* to see where you are in the flow",
    };
  }
  if (command === "CANCEL") {
    resetConversation(contactNumber);
    return {
      reply:
        "✅ Your current review has been cancelled.\nYou can type *Hi* anytime to start a new one.",
    };
  }
  if (command === "RESET" || command === "START") {
    resetConversation(contactNumber);
    startConversation(contactNumber);
    return {
      reply:
        "👋 Hey! I’d love to hear your thoughts.\n🛍️ Which *product* would you like to review today?",
    };
  }

  // Get or create conversation (handles timeout as well)
  let convo = getOrCreateConversation(contactNumber);

  // STATUS command (after ensuring convo exists)
  if (command === "STATUS") {
    if (!convo) {
      return {
        reply:
          "You’re not in the middle of a review right now. Type *Hi* to start one. 😊",
      };
    }
    let where;
    if (convo.step === STEPS.ASK_PRODUCT) where = "I’m waiting for the *product name*.";
    else if (convo.step === STEPS.ASK_NAME) where = "I’m waiting for *your name*.";
    else if (convo.step === STEPS.ASK_REVIEW) where = "I’m waiting for *your review*.";
    else where = "I’m a bit confused about the current step.";

    return {
      reply:
        "ℹ️ *Current status*\n" +
        `• Product: ${convo.productName || "_not provided_"}\n` +
        `• Name: ${convo.userName || "_not provided_"}\n` +
        `• Review: ${convo.productReview ? "✅ entered" : "_not provided_"}\n\n` +
        where,
    };
  }

  // Safeguard: if convo somehow missing still
  if (!convo) {
    startConversation(contactNumber);
    return {
      reply:
        "👋 Hi! Let’s start fresh.\n🛍️ Which *product* would you like to review?",
    };
  }

  // ====== STEP 1: ASK_PRODUCT ======
  if (convo.step === STEPS.ASK_PRODUCT) {
    // If user accidentally sends a *name* here (looks short and simple)
    if (!looksLikeReview(raw) && raw.split(" ").length <= 3 && /^[a-zA-Z\s.]+$/.test(raw)) {
      // We still treat it as product – because products can be simple words too
      const productName = extractProductName(raw);
      updateConversation(contactNumber, {
        step: STEPS.ASK_NAME,
        productName,
      });
      return {
        reply: `👍 Great! You’d like to review *${productName}*.\n👤 What’s your *name*?`,
      };
    }

    // Normal path: treat this as product description / name
    const productName = extractProductName(raw);
    if (productName.length < 2) {
      return {
        reply:
          "Could you please provide a slightly clearer product name? For example: *Samsung TV* or *iPhone 15 Pro*.",
      };
    }

    updateConversation(contactNumber, {
      step: STEPS.ASK_NAME,
      productName,
    });

    return {
      reply: `🔍 Got it! You’re reviewing *${productName}*.\n👤 What’s your *name*?`,
    };
  }

  // ====== STEP 2: ASK_NAME ======
  if (convo.step === STEPS.ASK_NAME) {
    // If they send something that looks like a full review instead of a name
    if (looksLikeReview(raw)) {
      return {
        reply:
          "That looks like a detailed review 😄\nBut first, could you please tell me your *name* (e.g., *Aditi*)?",
      };
    }

  const extractedName = extractName(raw);

  if (extractedName.length < 2 || extractedName.length > 50) {
    return {
      reply: "That doesn't look like a valid name. Could you try a simpler version? 😊"
    };
  }

  updateConversation(contactNumber, {
    step: STEPS.ASK_REVIEW,
    userName: extractedName,
  });

  return {
    reply: `Nice to meet you, *${extractedName}*! 😊\nNow please share your honest review of *${convo.productName}*.`
  };
}

  // ====== STEP 3: ASK_REVIEW ======
  if (convo.step === STEPS.ASK_REVIEW) {
    // Handle very short or very long reviews
    if (raw.length < MIN_REVIEW_LENGTH) {
      return {
        reply:
          "Thanks! Could you add a bit more detail to your review? A short sentence is enough. 😊",
      };
    }
    if (raw.length > MAX_REVIEW_LENGTH) {
      return {
        reply:
          "Wow, that’s a very detailed review! 😅\nCould you please shorten it a little so it’s under 1000 characters?",
      };
    }

    // If user tries to change product mid-way: detect phrases like "actually", "wrong"
    if (/actually|wrong product|change product|not this/gi.test(raw)) {
      updateConversation(contactNumber, {
        step: STEPS.ASK_PRODUCT,
        productName: null,
        userName: convo.userName, // keep name
      });
      return {
        reply:
          "No problem! Let’s update the product.\n🛍️ Which *product* would you like to review instead?",
      };
    }

    // Normal path: accept as review and complete
    const finalReview = raw;
    const finalData = {
      contactNumber,
      productName: convo.productName,
      userName: convo.userName,
      productReview: finalReview,
    };

    const reply =
      `🎉 Thank you *${convo.userName}*!\n` +
      `Your review for *${convo.productName}* has been recorded. 🙌\n\n` +
      `📝 *Your review:*\n"${finalReview}"\n\n` +
      `If you’d like to submit another review, just type *Hi* anytime.`;

    // Clean up conversation
    resetConversation(contactNumber);

    return {
      completed: true,
      data: finalData,
      reply,
    };
  }

  // ====== Fallback for unexpected step value ======
  resetConversation(contactNumber);
  return {
    reply:
      "⚠️ I got a bit confused about where we were.\nLet’s start fresh. Please type *Hi* to begin a new review. 😊",
  };
}

module.exports = {
  processIncomingMessage,
};
