const { pool } = require('../../config/database');

/**
 * Database function to get all club types
 */
const selectClubTypes = async () => {
    try {
        const result = await pool.query('SELECT * FROM club_type;');
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
const intertClubType = async (club_type) => {
    try {
        const result = await pool.query('INSERT INTO public.club_type (club_type) VALUES ($1) RETURNING id;', [club_type]);
        return result;
    } catch (e) {
        throw(e);
    }
};

/**
 * Database function to delete clubtype from database
 * @param {*} id 
 * @returns 
 */
const deleteClubTypeDB = async (id) => {
    try {
        const result = await pool.query('DELETE FROM public.club_type WHERE id = $1 RETURNING id;', [id]);
        return result;
    } catch (e) {
        throw(e);
    }
};

module.exports = {selectClubTypes, intertClubType, deleteClubTypeDB}