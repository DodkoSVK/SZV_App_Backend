/**
 * SQL queries for person operations
 * All queries are centralized here for better maintainability and reusability
 */

const personQueries = {
    // ============= SELECT QUERIES =============
    
    /**
     * Get all persons with their contacts and club info
     * Uses JSON_AGG to aggregate contacts into array
     */
    selectAll: `
        SELECT 
            p.id,
            p.first_name,
            p.last_name,
            TO_CHAR(p.birth_date, 'YYYY-MM-DD') AS birth_date,
            p.gender,
            p.club_id,
            c.name AS club_name,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', pc.id,
                        'contact_type', pc.contact_type,
                        'contact_value', pc.contact_value
                    ) ORDER BY pc.id
                ) FILTER (WHERE pc.id IS NOT NULL),
                '[]'
            ) AS contacts
        FROM person p
        LEFT JOIN club c ON p.club_id = c.id
        LEFT JOIN person_contact pc ON p.id = pc.person_id
        GROUP BY p.id, p.first_name, p.last_name, p.birth_date, p.gender, p.club_id, c.name
    `,
    
    /**
     * Get single person by ID with contacts and club info
     */
    selectById: `
        SELECT 
            p.id,
            p.first_name,
            p.last_name,
            TO_CHAR(p.birth_date, 'YYYY-MM-DD') AS birth_date,
            p.gender,
            p.club_id,
            c.name AS club_name,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', pc.id,
                        'contact_type', pc.contact_type,
                        'contact_value', pc.contact_value
                    ) ORDER BY pc.id
                ) FILTER (WHERE pc.id IS NOT NULL),
                '[]'
            ) AS contacts
        FROM person p
        LEFT JOIN club c ON p.club_id = c.id
        LEFT JOIN person_contact pc ON p.id = pc.person_id
        WHERE p.id = $1
        GROUP BY p.id, p.first_name, p.last_name, p.birth_date, p.gender, p.club_id, c.name
    `,
    
    /**
     * Get all persons without assigned club
     */
    selectWithoutClub: `
        SELECT 
            p.id,
            p.first_name,
            p.last_name,
            TO_CHAR(p.birth_date, 'YYYY-MM-DD') AS birth_date,
            p.gender,
            p.club_id,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', pc.id,
                        'contact_type', pc.contact_type,
                        'contact_value', pc.contact_value
                    ) ORDER BY pc.id
                ) FILTER (WHERE pc.id IS NOT NULL),
                '[]'
            ) AS contacts
        FROM person p
        LEFT JOIN person_contact pc ON p.id = pc.person_id
        WHERE p.club_id IS NULL
        GROUP BY p.id, p.first_name, p.last_name, p.birth_date, p.gender, p.club_id
    `,
    
    // ============= INSERT QUERIES =============
    
    /**
     * Insert new person
     */
    insertPerson: `
        INSERT INTO person (first_name, last_name, birth_date, gender, club_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, first_name, last_name, 
                  TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, 
                  gender, club_id
    `,
    
    /**
     * Insert person contact
     */
    insertContact: `
        INSERT INTO person_contact (person_id, contact_type, contact_value)
        VALUES ($1, $2, $3)
        RETURNING id, contact_type, contact_value
    `,
    
    // ============= UPDATE QUERIES =============
    
    /**
     * Generate dynamic UPDATE query for person table
     * @param {Object} fields - Object with column names as keys
     * @returns {String} SQL UPDATE query
     */
    buildUpdatePersonQuery: (fields) => {
        const setClause = Object.keys(fields)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        return `
            UPDATE person 
            SET ${setClause}
            WHERE id = $${Object.keys(fields).length + 1}
            RETURNING id, first_name, last_name, 
                      TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, 
                      gender, club_id
        `;
    },
    
    /**
     * Get person basic data (for update when no person fields changed)
     */
    selectPersonBasic: `
        SELECT id, first_name, last_name, 
               TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, 
               gender, club_id 
        FROM person 
        WHERE id = $1
    `,
    
    /**
     * Delete all contacts for a person (used before inserting new ones in update)
     */
    deleteContactsByPersonId: `
        DELETE FROM person_contact 
        WHERE person_id = $1
    `,
    
    /**
     * Get all contacts for a person
     */
    selectContactsByPersonId: `
        SELECT id, contact_type, contact_value 
        FROM person_contact 
        WHERE person_id = $1 
        ORDER BY id
    `,
    
    // ============= DELETE QUERIES =============
    
    /**
     * Delete person by ID
     * Note: Contacts are deleted automatically via CASCADE
     */
    deletePerson: `
        DELETE FROM person 
        WHERE id = $1 
        RETURNING id
    `,
    
    // ============= VALIDATION & HELPERS =============
    
    /**
     * Allowed columns for ORDER BY clause (prevents SQL injection)
     */
    allowedSortColumns: ['first_name', 'last_name', 'birth_date', 'gender', 'club_name'],
    
    /**
     * Map frontend field names to database column names for person table
     */
    personFieldMapping: {
        'first_name': 'first_name',
        'last_name': 'last_name',
        'birth_date': 'birth_date',
        'gender': 'gender',
        'club_id': 'club_id'
    },
    
    /**
     * Allowed contact types
     */
    allowedContactTypes: ['email', 'phone'],
    
    /**
     * Build ORDER BY clause with validation
     * @param {String} sortBy - Column name to sort by
     * @returns {String} ORDER BY clause or empty string
     */
    buildOrderByClause: (sortBy) => {
        if (!sortBy) return '';
        
        // Validate sortBy is in allowed columns
        if (personQueries.allowedSortColumns.includes(sortBy)) {
            // Map to actual column (handle club_name specially)
            const column = sortBy === 'club_name' ? 'c.name' : `p.${sortBy}`;
            return ` ORDER BY ${column}`;
        }
        
        return '';
    }
};

module.exports = personQueries;