const { pool } = require('../../config/database');
const clubQueries = require('../queries/clubQueries');


/**
 * Get all clubs with optional sorting
 * @param {String} sortBy - Column name to sort by (validated against allowedSortColumns)
 * @returns {Promise<Object>} Database query result
 */
const selectAllClubs = async (sortBy) => { 
    try {
        let query = clubQueries.selectAll;

        // Safe sorting - only allow predefined columns
        if (sortBy && clubQueries.allowedSortColumns.includes(sortBy)) 
            query += ` ORDER BY ${sortBy}`;
        else
            // Default sorting by club.name
            query += ` ORDER BY club.name`

        const result = await pool.query(query);
        return result
    } catch (e) {
        console.error('🔴 Database error in selectAllClubs:', e);
        throw e;
    }
};

/**
 * Get single club by ID
 * @param {Number} id - Club ID
 * @returns {Promise<Object>} Database query result
 */
const selectClubById = async (id) => {
    try {
        const result = await pool.query(clubQueries.selectById, [id];)
        return result;
    } catch (e) {
        console.error('🔴 Database error in selectClubById:', e);
        throw e;
    }
}

/**
 * Insert single club
 * @param {String} name - Club name
 * @param {Number} type - Club type
 * @param {Number} cityId - City ID (foreign key)
 * @param {String} street - Street address
 * @param {String} postal - Postal code
 * @param {String} ico - Organization ID number
 * @param {String} email - Email address
 * @param {String} phone - Phone number
 * @param {Number} chairman_id - Chairman person ID (foreign key)
 * @returns {Promise<Object>} Database query result with RETURNING id, name
 */
const insertClub = async (name, city, street, postal, ico, mail, tel, chairman_id) => {
    try {
        const result = await pool.query(
            clubQueries.insert,
            [name, type, cityId, street, postal, ico, email, phone, chairman_id]
        );
        return results;
    } catch (e) {       
        console.error('🔴 Database error in insertClub:', e); 
        throw e;
    }
};

/**
 * Bulk insert clubs with transaction
 * All clubs are inserted in a single transaction - if one fails, all are rolled back
 * @param {Array<Object>} clubs - Array of club objects
 * @returns {Promise<Array>} Array of inserted club records with id and name
 */
const insertClubBulk = async (clubs) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const insertedClubs = [];
        
        for (const club of clubs) {
            const { name, type, city_id, street, postal, ico, email, phone, chairman_id } = club;
            
            const result = await client.query(
                clubQueries.insert,
                [name, type, city_id, street, postal, ico, email, phone, chairman_id]
            );
            
            if (result.rows.length > 0) {
                insertedClubs.push(result.rows[0]);
            }
        }
        
        await client.query('COMMIT');
        console.log(`✅ Successfully inserted ${insertedClubs.length} clubs`);
        return insertedClubs;
        
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('🔴 Database error in insertClubBulk, transaction rolled back:', e);
        throw e;
    } finally {
        client.release();
    }
};

/**
 * Update club with dynamic fields
 * @param {Number} id - Club ID
 * @param {Object} fieldsToUpdate - Object with column names as keys and values to update
 * @returns {Promise<Object>} Database query result with RETURNING id, name
 */
const updateClub = async (id, fieldsToUpdate) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Build dynamic UPDATE query
        const updateQuery = clubQueries.buildUpdateQuery(fieldsToUpdate);
        const values = [...Object.values(fieldsToUpdate), id];
        
        const result = await client.query(updateQuery, values);
        
        // If chairman is being updated, update the person's club_id as well
        if (fieldsToUpdate.chairman_id) {
            await client.query(
                clubQueries.updatePersonClub,
                [id, fieldsToUpdate.chairman_id]
            );
            console.log(`✅ Updated person ${fieldsToUpdate.chairman_id} club_id to ${id}`);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Successfully updated club ID ${id}`);
        return result;
        
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('🔴 Database error in updateClub, transaction rolled back:', e);
        throw e;
    } finally {
        client.release();
    }
};

/**
 * Delete club by ID
 * @param {Number} id - Club ID
 * @returns {Promise<Object>} Database query result with RETURNING id, name
 */
const deleteClubDB = async (id) => {
    try {
        const result = await pool.query(clubQueries.delete, [id]);
        
        if (result.rowCount > 0) {
            console.log(`✅ Successfully deleted club ID ${id}`);
        }
        
        return result;
    } catch (e) {
        console.error('🔴 Database error in deleteClubDB:', e);
        throw e;
    }
};

module.exports = {
    selectAllClubs,
    selectClubById,
    insertClub,
    insertClubBulk,
    updateClub,
    deleteClubDB
};