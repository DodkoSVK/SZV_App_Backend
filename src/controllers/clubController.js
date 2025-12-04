const clubModel = require('../models/clubsModel');
const clubSchema = require('../schemas/clubSchema');

/**
 * Get all clubs with optional sorting
 * @route GET /api/club?sortBy=name
 */
const getClub = async (req, res) => {
    const { sortBy } = req.query;

    // Validate sortBy parameter provided
    if (sortBy) {
        const { error } = clubSchema.sortClubSchema.validate({ sortBy });
        if(error)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
    }

    try {
        const result = await clubModel.selectAllClubs(sortBy);

        // Empty result is OK - return empty array
        if (result.rows.length < 1)
            return res.status(200).json({
                success: true,
                message: "V databáze sa nenachádzajú žiadne kluby",
                data: []
            });

        return res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (e) {
        console.error(`🔴 Error in getClub: ${e.message}`, e);
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};

/**
 * Get single club by ID
 * @route GET /api/club/:id
 */
const getClubById = async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter
    const { error } = clubSchema.sortIdSchema.validate({ id: parseInt(id) });
    if(error)
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    
    try {
       const result = await clubModel.selectClubById(parseInt(id));

        if (result.rows.length < 1)
            return res.status(404).json({
                success: false,
                message: `Klub s ID ${id} nebol nájdený`
            });

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (e) {
        console.error(`🔴 Error in getClubById: ${e.message}`, e);
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};

/**
 * Create new club(s) - supports single object or array
 * @route POST /api/club
 */
const createClub = async (req, res) => {
    let clubs = req.body;

    // Convert single object to array for uniform processing
    if (!Array.isArray(clubs)) {
        clubs = [clubs];
    }

    // Validate all clubs before inserting any
    for (let i = 0; i < clubs.length; i++) {
        const { error } = clubSchema.createClubSchema.validate(clubs[i]);
        if (error)
            return res.status(400).json({
                success: false,
                message: `Chyba v zázname klubu na pozícii ${i + 1}: ${error.details[0].message}`
            });
    }

    try {
        const insertedClubs = await clubModel.insertClubBulk(clubs);

        return res.status(201).json({
            success: true,
            message: `Vytvorených ${insertedClubs.length} klubov`,
            data: insertedClubs
        });        
    } catch (e) {
        console.error(`🔴 Error in createClub: ${e.message}`, e);

        // Check for specific database errors
        if (e.code === '23505') // Unique violation
            return res.status(409).json({
                success: false,
                message: "Klub s týmto IČO už existuje."
            });
                
        if (e.code === '23503') // Foreign key violation
            return res.status(400).json({
                success: false,
                message: "Neplatné ID predsedu alebo mesta."
            });
        
        
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};

/**
 * Update existing club by ID
 * @route PATCH /api/club/:id
 */
const editClub = async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter
    const { error: idError } = clubSchema.sortIdSchema.validate({ id: parseInt(id)})
    if (idError)
        return res.status(400).json({
            success: false,
            message: idError.details[0].message
        });

    // Validate request body
    const { error } = clubSchema.editClubSchema.validate(req.body); 
    if (error)
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    
    // Check if there's anything to update
    const allowedFields = ['name', 'type', 'city_id', 'street', 'postal', 'ico', 'email', 'phone', 'chairmain_id'];
    let fieldsToUpdate = {};
    
    allowedFields.forEach(field => {
        if(req.body[field] !== undefined)
            fieldsToUpdate[field] = req.body[field];
    })

    if (Object.keys(fieldsToUpdate).length === 0) 
         return res.status(400).json({
            success: false,
            message: "Neboli poskytnuté žiadne polia na aktualizáciu"
        });


    try {
        const result = await clubModel.updateClub(parseInt(id), fieldsToUpdate);

        if (result.rowCount === 0)
            return res.status(404).json({
                success: false,
                message: `Klub s ID ${id} nebol nájdený`
            });
        
        return res.status(200).json({
            success: true,
            message: `Klub s ID ${id} bol úspešne aktualizovaný`,
            data: result.rows[0]
        });

    } catch (e) {
        console.error(`🔴 Error in editClub: ${e.message}`, e);
        
        // Check for specific database errors
        if (e.code === '23505') 
            return res.status(409).json({
                success: false,
                message: "Klub s týmto IČO už existuje."
            });        
        
        if (e.code === '23503') 
            return res.status(400).json({
                success: false,
                message: "Neplatné ID predsedu alebo mesta."
            });        
        
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    
    }   
};

/**
 * Delete club by ID
 * @route DELETE /api/club/:id
 */
const deleteClub = async (req, res) => {
    const { id } = req.params;
    
    // Validate ID parameter
    const { error } = clubSchema.sortIdSchema.validate({ id: parseInt(id) });
    if (error) 
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    
    try {
        const result = await clubModel.deleteClubDB(parseInt(id));
        
        if (result.rowCount === 0) 
            return res.status(404).json({
                success: false,
                message: `Klub s ID ${id} nebol nájdený`
            });

        return res.status(200).json({
            success: true,
            message: `Klub "${result.rows[0].name}" (ID: ${result.rows[0].id}) bol vymazaný`,
            data: result.rows[0]
        });
    } catch (e) {
        console.error(`🔴 Error in deleteClub: ${e.message}`, e);
        
        // Check for foreign key constraint
        if (e.code === '23503')
            return res.status(409).json({
                success: false,
                message: "Klub nemožno vymazať, pretože existujú záznamy ktoré naň odkazujú."
            });
        
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};

module.exports = {getClub, getClubById, createClub, editClub, deleteClub};