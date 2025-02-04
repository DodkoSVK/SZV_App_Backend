const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.on('connect', () => {
    console.log('Connected to DB');
});
pool.on('error', (e) => {
    console.log(`Problem with connectig to DB: ${e}`);
    process.exit(-1);
});

module.exports = { pool };