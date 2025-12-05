const { pool } = require('../../config/database');
const personQueries = require('../queries/personQueries');

/**
 * Get all persons with their contacts, optionally sorted
 * Returns persons with contacts aggregated into array
 */
const selectPerson = async (sortBy) => {
    try {
        let query = personQueries.selectAll;
        query += personQueries.buildOrderByClause(sortBy);
        query += ';';

        const result = await pool.query(query);
        return result;
    } catch (e) {
        throw e;
    }
};

/**
 * Get all persons without assigned club
 */
const selectPersonWithoutClub = async () => {
    try {
        const result = await pool.query(personQueries.selectPersonWithoutClub);
        return result;
    } catch (e) {
        throw e
    }
};

/**
 * Get single person by ID with their contacts
 */
const selectPersonById = async (id) => {
    try {
        const result = await pool.query(personQueries.selectById, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (e) {
        throw e;
    }
};

/**
 * Bulk insert persons with their contacts
 * @param {Array} persons - Array of person objects with contacts
 * Each person: { first_name, last_name, birth_date, gender, club_id, contacts: [...] }
 */
const insertPersonBulk = async (persons) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const insertedPersons = [];

        for (const person of persons) {
            // Insert person
            const personResult = await client.query(
                personQueries.insertPerson,
                [
                    person.first_name,
                    person.last_name,
                    person.birth_date,
                    person.gender,
                    person.club_id
                ]
            );

            const insertedPerson = personResult.rows[0];
            const personId = insertedPerson.id;

            // Insert contact for this person
            const contacts = [];
            if (person.contacts && person.contacts.length > 0) {
                for (const contact of person.contacts) {
                    const contactResult = await client.query(
                        personQueries.insertContact,
                        [
                            personId,
                            contact.contact_type,
                            contact.contact_value
                        ]
                    );

                    contacts.push(contactResult.rows[0]);
                }
            }

            // Add contact to person object
            insertedPerson.contact = contacts;
            insertedPersons.push(insertPerson);   
        }

        await client.query('COMMIT');
        return insertPerson;

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

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