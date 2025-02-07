const { pool } = require('../../config/database');

const selectPerson = async (sortBy) => {
   try {
        let query = 'SELECT * FROM public.person ';
        if(sortBy)
            query += ` ORDER BY ${sortBy};`;
        else
            ';';
        const result = await pool.query(query);
        return result;
   } catch (e) {
        throw e;
   }
};
const selectPersonById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM public.person WHERE id=$1', [id]);
        return result;
    } catch (e) {
        throw e;
    }
};
const insertPerson = async (name, surname, birth, club) => {
    try {
        const result = await pool.query('INSERT INTO public.person (name, surname, birth, club) VALUES ($1, $2, $3, $4) RETURNING id;', [name, surname, birth, club]);
        return result;        
    } catch (e) {
        throw e;
    }
};
const updatePerson = () => {

};
const deletePerson = () => {

};


module.exports = { selectPerson, selectPersonById, insertPerson, updatePerson, deletePerson};