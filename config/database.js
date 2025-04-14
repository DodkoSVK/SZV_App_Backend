const { Pool } = require('pg');
require('dotenv').config();

/* const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false, // ak nechceš riešiť certifikáty
    },
}); */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('Connected to DB');
});
pool.on('error', (e) => {
    console.log(`Problem with connectig to DB: ${e}`);
    process.exit(-1);
});

module.exports = { pool };