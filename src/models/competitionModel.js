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

const insertCompetition = async (year, league, round, date) => {
    try {
        const results = await pool.query(
            'INSERT INTO public.competition (year, league_id, round, comp_date) VALUES ($1, $2, $3, $4) returning id AS competition_id;', [year, league, round, date]
        );
        return results;
    } catch (e) {
        throw e;
    }
}

const insertCompetitionLocation = async (competition_id, group_name, club_id, city) => {
    try {
        const results = await pool.query(
            'INSERT INTO public.competition_location (competition_id, group_name, club_id, city) VALUES ($1, $2, $3, $4) returning id;', [competition_id, group_name, club_id, city]
        );
        return results;
    } catch (e) {
        throw e;
    }
}

const updateCompetition = async (competition_id, fieldsToUpdate) => {
    try {
        const setClause = Object.keys(fieldsToUpdate)
            .map((key, index) => `${key} = $${index+1}`)
            .join(', ');
        const values = Object.values(fieldsToUpdate);
        values.push(competition_id);
        return await pool.query(`UPDATE competition SET ${setClause} WHERE id = $${values.length} RETURNING id;`, values);
    } catch (e) {
        throw e;
    }
};

const updateCompetitionLocation = async (location_id, fieldsToUpdate) => {
    try {
        const setClause = Object.keys(fieldsToUpdate)
            .map((key, index) => `${key} = $${index+1}`)
            .join(', ');
        const values = Object.values(fieldsToUpdate);
        values.push(location_id);
        return await pool.query(`UPDATE competition_location SET ${setClause} WHERE id = $${values.length} RETURNING id;`, values)
    } catch (e) {
        throw e;
    }
}
module.exports = { selectCompetition, searchCompetition, insertCompetition, insertCompetitionLocation, updateCompetition, updateCompetitionLocation};