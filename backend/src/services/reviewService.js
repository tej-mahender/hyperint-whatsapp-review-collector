const pool = require("../db/pool");

async function createReview({ contactNumber, userName, productName, productReview }) {
  const query = `
    INSERT INTO reviews (contact_number, user_name, product_name, product_review)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [contactNumber, userName, productName, productReview];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function getAllReviews() {
  const query = `
    SELECT id, contact_number, user_name, product_name, product_review, created_at
    FROM reviews
    ORDER BY created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

module.exports = {
  createReview,
  getAllReviews,
};
