/**
 * SQL queries for club operations
 * All queries are centralized here for better maintainability and reusability
 */

const clubQueries = {
    // ============= SELECT QUERIES =============
    
    /**
     * Get all clubs with joins to city and chairman (person)
     */
    selectAll: `
        SELECT 
            club.id, 
            club.name,
            city.name AS city,
            city.id AS city_id,
            club.street, 
            club.postal, 
            club.ico, 
            club.email, 
            club.phone,
            COALESCE(person.first_name, 'Štatutár') AS fname,
            COALESCE(person.last_name, 'Nepriradený') AS sname,
            COALESCE(person.id, 0) AS chairman_id
        FROM public.club 
        LEFT JOIN public.person ON club.chairman_id = person.id
        LEFT JOIN public.city ON club.city_id = city.id
    `,
    
    /**
     * Get single club by ID
     */
    selectById: `
        SELECT 
            club.id, 
            club.name,
            city.name AS city,
            city.id AS city_id,
            club.street, 
            club.postal, 
            club.ico, 
            club.email, 
            club.phone,
            person.id AS chairman_id, 
            person.first_name AS fname, 
            person.last_name AS sname
        FROM public.club 
        LEFT JOIN public.person ON club.chairman_id = person.id
        LEFT JOIN public.city ON club.city_id = city.id
        WHERE club.id = $1
    `,
    
    // ============= INSERT QUERIES =============
    
    /**
     * Insert new club
     */
    insert: `
        INSERT INTO public.club 
        (name, city_id, street, postal, ico, email, phone, chairman_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id, name
    `,
    
    // ============= UPDATE QUERIES =============
    
    /**
     * Generate dynamic UPDATE query based on fields to update
     * @param {Object} fields - Object with column names as keys
     * @returns {String} SQL UPDATE query
     */
    buildUpdateQuery: (fields) => {
        const setClause = Object.keys(fields)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        return `
            UPDATE public.club 
            SET ${setClause}
            WHERE id = $${Object.keys(fields).length + 1} 
            RETURNING id, name
        `;
    },
    
    /**
     * Update person's club_id when assigning chairman
     */
    updatePersonClub: `
        UPDATE public.person 
        SET club_id = $1 
        WHERE id = $2
    `,
    
    // ============= DELETE QUERIES =============
    
    /**
     * Delete club by ID
     */
    delete: `
        DELETE FROM public.club 
        WHERE id = $1 
        RETURNING id, name
    `,
    
    // ============= VALIDATION & HELPERS =============
    
    /**
     * Allowed columns for ORDER BY clause (prevents SQL injection)
     */
    allowedSortColumns: ['id', 'name', 'city', 'ico', 'phone', 'chairman_id'],
    
    /**
     * Map frontend field names to database column names
     */
    fieldMapping: {
        'name': 'name',
        'city_id': 'city_id',
        'street': 'street',
        'postal': 'postal',
        'ico': 'ico',
        'email': 'email',
        'phone': 'phone',
        'chairman_id': 'chairman_id'
    }
};

module.exports = clubQueries;