const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Twilio sends x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use(routes);
app.use(errorHandler);

module.exports = app;
