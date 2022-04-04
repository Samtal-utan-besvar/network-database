const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    database: 'user_database',
    host: 'localhost',
    port: 5432
});

module.exports = pool;