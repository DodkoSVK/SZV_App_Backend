const { pool } = require('../../config/database');

/**
 * Database function for get clubs from DB with optional parameter for sorting
 * @param {*} sortBy -> id, name, city, ico (Identifikacne Cislo Organizacie), tel, chairman
 */
const getAllClubsDB = async (sortBy) => {   
   let query = 'SELECT * FROM public.club';
    try {
        if(sortBy)
            query += ` ORDER BY ${sortBy};`;

        const result = await pool.query(query);
        return result;
    } catch (e) {
        throw e;
    }
};
/**
 * Database function for get a club by ID
 * @param {*} id -> Club ID
 * @returns 
 */
const getClubByIDDB = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM public.club WHERE public.club.id = $1', [id]);
        return result;
    } catch (e) {
        throw e;
    }
}
/**
 * Database function for create a new club.
 * @param {*} name -> Varchar
 * @param {*} type -> Int
 * @param {*} city -> Varchar
 * @param {*} street -> Varchar
 * @param {*} postal -> Varchar
 * @param {*} ico -> Varchar
 * @param {*} mail -> Varchar
 * @param {*} tel -> Varchar
 * @param {*} chairman -> Int
 * @return {*} 
 */
const createClubInDb = async (name, type, city, street, postal, ico, mail, tel, chairman) => {
    try {
        const results = await pool.query('INSERT INTO public.club (name, type, city, street, postal, ico, mail, tel, chairman) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;', [name, type, city, street, postal, ico, mail, tel, chairman]);
        return results;
    } catch (e) {        
        throw e;
    }
};

/**
 * Database function to update a club
 * @param {*} fieldsToUpdate -> Which columns been updated
 * @param {*} valuesToUpdate -> Values corresponsing to columns
 * @returns 
 */
const editClubDB = async (fieldsToUpdate, valuesToUpdate) => {
    try {
        const results = await pool.query(`UPDATE public.club SET ${fieldsToUpdate.join(', ')} WHERE id = $${fieldsToUpdate.length+1} RETURNING id;`, valuesToUpdate);
        return results;
    } catch (e) {
        throw e;
    }
};

/**
 * Database function to delete club from DB
 * @param {*} id -> Club ID
 * @returns 
 */
const deleteClubDB = async (id) => {
    try {
        const results = await pool.query('DELETE FROM public.club WHERE id = $1 RETURNING id;', [id]);
        return results;
    } catch (e) {
        throw e;
    }
};

module.exports = {getAllClubsDB, getClubByIDDB, createClubInDb, editClubDB, deleteClubDB};