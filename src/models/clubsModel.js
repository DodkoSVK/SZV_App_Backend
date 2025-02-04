const { pool } = require('../../config/database');

const createClubInDb = async (name, type, city, street, postal, ico, mail, tel, chairman) => {
    try {
        const results = await pool.query('INSERT INTO public.club (name, type, city, street, postal, ico, mail, tel, chairman) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;', [name, type, city, street, postal, ico, mail, tel, chairman]);
        return results;
    } catch (e) {        
        throw e;
    }
};

module.exports = {createClubInDb};