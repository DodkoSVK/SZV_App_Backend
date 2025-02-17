const { pool } = require('../../config/database');

const selectPerson = async (sortBy) => {
   try {
        let query = `SELECT person.id, person.fname, person.sname, TO_CHAR(person.birth, 'DD.MM.YYYY') AS birth, club.name AS club
            FROM public.person
            LEFT JOIN public.club
            ON public.person.club = public.club.id`;
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
const selectPersonWithoutClub = async () => {
    try {
        return await pool.query('SELECT * FROM person WHERE club IS NULL OR club = 0;')
    } catch (e) {
        throw e
    }
}
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
        const result = await pool.query('INSERT INTO public.person (fname, sname, birth, club) VALUES ($1, $2, $3, $4) RETURNING id;', [name, surname, birth, club]);
        return result;        
    } catch (e) {
        throw e;
    }
};
const updatePerson = async (id, fieldsToUpdate) => {
    try {
        const setClause = Object.keys(fieldsToUpdate)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const values = Object.values(fieldsToUpdate);
        values.push(id);   
        return await pool.query(`UPDATE person SET ${setClause} WHERE id = $${values.length} RETURNING id;`, values);
    } catch (e) {
        throw e;        
    }
};
const deletePerson = () => {

};


module.exports = { selectPerson, selectPersonWithoutClub, selectPersonById, insertPerson, updatePerson, deletePerson};