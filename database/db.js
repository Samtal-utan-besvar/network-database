const Pool = require('pg').Pool;

// Setup the database pool with values from the .env file
const pool = new Pool({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
});

module.exports = pool;