require("dotenv").config();

const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

module.exports = config;
