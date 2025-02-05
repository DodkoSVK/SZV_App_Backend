const { pool } = require('../../config/database');

/**
 * Database function to get all club types
 */
const getClubTypeDB = async () => {
    try {
        const result = await pool.query('SELECT * FROM club_type ORDER BY id;');
        return result;
    } catch (e) {
        console.log(`Erorrik ${e}`);
        throw(e);
    }
};

/**
 * Database function to create a new club type
 * @param {*} club_type 
 * @returns 
 */
const createClubTypeDB = async (club_type) => {
    try {
        const result = await pool.query('INSERT INTO public.club_type (club_type) VALUES ($1) RETURNING id;', [club_type]);
        return result;
    } catch (e) {
        throw(e);
    }
};

module.exports = {getClubTypeDB, createClubTypeDB}