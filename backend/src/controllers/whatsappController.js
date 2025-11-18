const { MessagingResponse } = require("twilio").twiml;
const { processIncomingMessage } = require("../services/conversationService");
const reviewService = require("../services/reviewService");

async function handleWebhook(req, res, next) {
  try {
    const from = req.body.From;   // e.g. 'whatsapp:+1415XXXX'
    const body = (req.body.Body || "").trim();
    const contactNumber = from;   // you may store as-is

    const result = processIncomingMessage(contactNumber, body);

    const twiml = new MessagingResponse();

    if (result.completed) {
      await reviewService.createReview(result.data);
      twiml.message(result.reply);
    } else {
      twiml.message(result.reply);
    }

    res.type("text/xml").send(twiml.toString());
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleWebhook,
};
