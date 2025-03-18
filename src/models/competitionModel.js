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

const insertCompetition = async (year, league, round) => {
    try {
        const results = await pool.query(
            'INSERT INTO public.competition (year, league_id, round) VALUES ($1, $2, $3) returning id AS competition_id;', [year, league, round]
        );
        return results;
    } catch (e) {
        throw e;
    }
}

const insertCompetitionLocation = async (competition_id, group_name, city, date, club_id) => {
    try {
        const results = await pool.query(
            'INSERT INTO public.competition_location (competition_id, group_name, city, date, club_id) VALUES ($1, $2, $3, $4, $5) returning id;', [competition_id, group_name, city, date, club_id]
        );
        return results;
    } catch (e) {
        throw e;
    }
}

module.exports = { selectCompetition, searchCompetition, insertCompetition, insertCompetitionLocation };