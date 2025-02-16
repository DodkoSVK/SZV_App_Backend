const { pool } = require('../../config/database');

/**
 * Database function for get clubs from DB with optional parameter for sorting
 * @param {*} sortBy -> id, name, city, ico (Identifikacne Cislo Organizacie), tel, chairman
 */
const selectAllClubs = async (sortBy) => {   
   let query = `SELECT club.id, club.name, club.city, club.street, club.postal, club.ico, club.mail, club.tel, COALESCE(person.f_name, 'Štatutár') AS f_name,  COALESCE(person.surname, 'Nepriradený') AS surname
                FROM public.club 
                LEFT JOIN public.person 
                ON public.club.chairman = public.person.id`;

    if(sortBy)
        console.log(`Sort by: ${sortBy}`);
    try {
        if(sortBy)
            query += ` ORDER BY ${sortBy};`;
        else
            query += ';';
        
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
const selectClubById = async (id) => {
    try {
        const result = await pool.query(`SELECT club.id, club.name, club.city, club.street, club.postal, club.ico, club.mail, club.tel, person.f_name, person.surname
            FROM public.club 
            LEFT JOIN public.person 
            ON public.club.chairman = public.person.id WHERE club.id =$1`, [id]);
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
const insertClub = async (name, city, street, postal, ico, mail, tel, chairman) => {
    try {
        const results = await pool.query('INSERT INTO public.club (name, city, street, postal, ico, mail, tel, chairman) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;', [name, city, street, postal, ico, mail, tel, chairman]);
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
const updateClub = async (id, fieldsToUpdate) => {
    try {
        const setClause = Object.keys(fieldsToUpdate)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const values = Object.values(fieldsToUpdate);
        values.push(id);
       return await pool.query(`UPDATE public.club SET ${setClause} WHERE id = $${values.length} RETURNING id;`, values);
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

module.exports = {selectAllClubs, selectClubById, insertClub, updateClub, deleteClubDB};