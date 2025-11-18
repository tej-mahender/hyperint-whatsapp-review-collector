const { Pool } = require("pg");
const config = require("../config/config");

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
  process.exit(-1);
});

module.exports = pool;
