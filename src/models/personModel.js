const { pool } = require('../../config/database');

const selectPerson = async (sortBy) => {
    try {
        let query = `SELECT 	p.id, p.fname, p.sname,	TO_CHAR(p.birth, 'YYYY-MM-DD') AS birth, c.name AS club, c.id AS club_id, a.login AS login, i.email, i.phone
            FROM public.person p
            LEFT JOIN public.club c ON p.club = c.id
            LEFT JOIN public.auth a ON p.id = a.person_id
            LEFT JOIN public.person_contact i ON p.id = i.person_id;`;
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
const insertPerson = async (name, surname, birth, club_id, email, phone) => {
    try {
        const result = await pool.query('INSERT INTO public.person (fname, sname, birth, club) VALUES ($1, $2, $3, $4) RETURNING id;', [name, surname, birth, club_id]);
        const personId = result.rows[0]?.id;
        if (!personId || isNaN(personId)) {
            throw new Error("ID of person after insert is not valid");
        }
        const result2 = await pool.query('INSERT INTO public.person_contact (person_id, email, phone) VALUES ($1, $2, $3) RETURNING id;', [personId, email, phone]);
        return result2;        
    } catch (e) {
        throw e;
    }
};
const updatePerson = async (id, fieldsToUpdate, fieldsToUpdate2) => {
    try {
        const setClause = Object.keys(fieldsToUpdate)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const values = Object.values(fieldsToUpdate);
        values.push(id);   
        personResults = await pool.query(`UPDATE person SET ${setClause} WHERE id = $${values.length} RETURNING id;`, values);
        const personId = personResults.rows[0]?.id;
        if (!personId || isNaN(personId)) {
            throw new Error("ID of person after insert is not valid");
        }

        const contactClause = Object.keys(fieldsToUpdate2)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const values2 = Object.values(fieldsToUpdate2)
        values2.push(id);      
        console.log(`Constact clause ${contactClause}, values2: ${values2}`);
        console.log(`Query: `)
        console.log(
            "SQL:",
            `UPDATE person_contact SET ${contactClause} WHERE person_id = $${values2.length} RETURNING id;`
          );
        console.log("Values:", values2);

        return await pool.query(`UPDATE person_contact SET ${contactClause} WHERE person_id = $${values2.length} RETURNING id;`, values2);
    } catch (e) {
        throw e;        
    }
};
const deletePerson = async (id) => {
    try {
        const results = await pool.query('DELETE FROM public.person WHERE id = $1 RETURNING id;', [id]);
        return results;
    } catch (e) {
        throw e;
    }
};


module.exports = { selectPerson, selectPersonWithoutClub, selectPersonById, insertPerson, updatePerson, deletePerson};