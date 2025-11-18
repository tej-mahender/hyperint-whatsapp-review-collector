const express = require("express");
const router = express.Router();

const reviewRoutes = require("./review.routes");
const whatsappRoutes = require("./whatsapp.routes");

router.use("/api/reviews", reviewRoutes);
router.use("/webhook", whatsappRoutes);

module.exports = router;
