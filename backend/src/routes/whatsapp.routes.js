const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");

// POST /webhook
router.post("/", whatsappController.handleWebhook);

module.exports = router;
