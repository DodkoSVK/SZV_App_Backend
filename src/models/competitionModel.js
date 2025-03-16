const { pool } = require('../../config/database');

const selectCompetition = async (sortBy) => {
    try {
        let query = 'Select * FROM public.competitions';        
        if (sortBy)
            query += ` ORDER BY ${sortBy};`;
        else
            ';';
        const results = await pool.query(query);
        return results;
    } catch (e) {
        throw e;        
    }
}

const searchCompetition = async (searchBy) => {
    try {
        let query = 'SELECT * FROM public.competitions WHERE ';
        let queryParams = [];
        let queryValues = [];

        if(searchBy) {
            Object.keys(searchBy).forEach((key, index) => {
                queryParams.push(`${key} ILIKE $${index + 1}`);
                queryValues.push(`%${searchBy[key]}%`);
            });
        }

        if(queryValues.length > 0)
            query += queryParams.join(' AND ') + ';';
        else
            ';';

        console.log("🟡 SQL Query (POST):", query);
        console.log("🟡 Params:", queryValues); // Opravený log

        const results = await pool.query(query, queryValues);
        return results
    } catch (e) {
        throw e;
    }
}

module.exports = { selectCompetition, searchCompetition };