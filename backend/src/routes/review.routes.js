const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// GET /api/reviews
router.get("/", reviewController.getReviews);

module.exports = router;
