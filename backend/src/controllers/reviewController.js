const reviewService = require("../services/reviewService");

async function getReviews(req, res, next) {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReviews,
};
