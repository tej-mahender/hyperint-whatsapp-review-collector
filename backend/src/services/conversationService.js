// Very simple in-memory store: { phoneNumber: {...} }
const conversations = {};

function resetConversation(contactNumber) {
  delete conversations[contactNumber];
}

function startConversation(contactNumber) {
  conversations[contactNumber] = {
    step: 1,
    productName: null,
    userName: null,
    productReview: null,
  };
}

function processIncomingMessage(contactNumber, message) {
  // Optional: allow user to reset manually
  if (message.toLowerCase() === "reset" || message.toLowerCase() === "hi") {
    startConversation(contactNumber);
    return { reply: "Which product is this review for?" };
  }

  let convo = conversations[contactNumber];

  if (!convo) {
    startConversation(contactNumber);
    return { reply: "Which product is this review for?" };
  }

  if (convo.step === 1) {
    convo.productName = message;
    convo.step = 2;
    return { reply: "What's your name?" };
  }

  if (convo.step === 2) {
    convo.userName = message;
    convo.step = 3;
    return { reply: `Please send your review for ${convo.productName}.` };
  }

  if (convo.step === 3) {
    convo.productReview = message;
    const response = {
      completed: true,
      data: {
        contactNumber,
        productName: convo.productName,
        userName: convo.userName,
        productReview: convo.productReview,
      },
      reply: `Thanks ${convo.userName} — your review for ${convo.productName} has been recorded.`,
    };
    resetConversation(contactNumber);
    return response;
  }

  // fallback
  resetConversation(contactNumber);
  return {
    reply: "Something went wrong, please type 'Hi' to start again.",
  };
}

module.exports = {
  processIncomingMessage,
};
