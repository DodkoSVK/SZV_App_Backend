const personModels = require('../models/personModel');
const personSchema = require('../schemas/personSchema');



/**
 * Get all persons with optional sorting
 * @route GET /api/club?sortBy=name
 */
const getPerson = async (req, res) => {
    const { sortBy } = req.query;    

    // Validate sortBy parameter provided
    if(sortBy) {
        const { error } = personSchema.sortPersonSchema.validate({sortBy});
        if (error)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
    }

    try {
        const result = await personModels.selectPerson(sortBy);

        // Empty result ist OK - return empty array
        if (result.rows.length < 1)
            return res.status(200).json({
                success: true,
                message: "V databáze sa nenachádzajú žiadne osoby",
                data: []
            });

        return res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (e) {
        console.error(`🔴 Error in getPerson: ${e.message}`, e);
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};

/**
 * Get all persons without assigned club
 * @route GET /api/person/without-club
 */
const getPersonWithoutClub = async (req, res) => {
    try {
        const result = await personModels.selectPersonWithoutClub();

        if (result.rows.length < 1)
            // Empty result ist OK - return empty array
            if (result.rows.length < 1)
                return res.status(200).json({
                    success: true,
                    message: "V databáze sa nenachádzajú žiadne osoby",
                    data: []
                });

            return res.status(200).json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });

    } catch (e) {
        console.error(`🔴 Error in getPersonWithoutClub: ${e.message}`, e);
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
}

/**
 * Get person by ID
 * @route GET /api/person/:id
 */
const getPersonByID = async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter
    const { error } = personSchema.sortPersonIdSchema.validate({id: parseInt(id)});
    if(error)
       return res.status(400).json({
            success: false,
            message: error.details[0].message
        });

    try {
        const result = await personModels.selectPersonById(parseInt(id));
        
        if(result.rows.length < 1) 
            return res.status(404).json({
                success: false,
                message: "Osoba nebola nájdená"
            });

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (e) {
        console.error(`🔴 Error in getPersonByID: ${e.message}`, e);
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};

/**
 * Create new person
 * @route POST /api/person
 */
const createPerson = async (req, res) => {
    let persons = req.body;

    // Convert single object to array for uniform processing
    if(!Array.isArray(persons))
        persons = [persons];

    // Validate all persons before inserting any
    for (let i = 0; i < persons.lenght; i++) {
        const { error } = personSchema.createPersonSchema.validate(persons[i]);
        if (error)
            return res.status(400).json({
                success: false,
                message: `Chyba v zázname osoby na pozícii ${i + 1}: ${error.details[0].message}`
            });
        
        // Convert club_id = 0 to null for each person
        if (persons[i].club_id === 0) 
            persons[i].club_id = null;
    }

    try {
        const insertedPersons = await personModels.insertPersonBulk(persons);

        return res.status(201).json({
            success: true,
            message: `Vytvorených ${insertedPersons.length} osôb`,
            data: insertedPersons
        });
    } catch (e) {
        console.error(`🔴 Error in createPerson: ${e.message}`, e);

        // Check for specific database errors
        if (e.code === '23505') { // Unique violation
            // Zisti ktorý constraint zlyhal
            if (e.constraint === 'person_email_key') 
                return res.status(409).json({
                    success: false,
                    message: "Osoba s týmto emailom už existuje."
                });
            
            if (e.constraint === 'person_phone_key') 
                return res.status(409).json({
                    success: false,
                    message: "Osoba s týmto telefónnym číslom už existuje."
                });
            
            return res.status(409).json({
                success: false,
                message: "Osoba s týmito údajmi už existuje."
            });
        }
        if (e.code === '23503') // Foreign key violation
            return res.status(400).json({
                success: false,
                message: "Neplatné ID klubu."
            });

        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};
/**
 * Update existing person by ID
 * @route PATCH /api/person/:id
 */
const editPerson = async (req, res) => {
    const { id } = req.params;

    // Validate ID parameter
    const { error: idError } = personSchema.personIdSchema.validate({ id: parseInt(id) });
    if (idError)
        return res.status(400).json({
            success: false,
            message: idError.details[0].message
        });

    // Validate request body
    const { error } = personSchema.updatePersonSchema.validate(req.body);
    if (error)
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });

    // Check if there is anything to update
    const allowedFields = ['fname', 'sname', 'birth', 'club_id', 'email', 'phone'];
    let fieldsToUpdate = {};

    allowedFields.forEach(field => {
        if(req.body[field] !== undefined) {
            // Special handling for club_id: convert 0 to null
            if (field === 'club_id' && req.body[field] === 0)
                fieldsToUpdate[field] = null;
            else
                fieldsToUpdate[field] = req.body[field];
        }
    });

    if(Object.keys(fieldsToUpdate).length === 0)
        return res.status(400).json({
            success: false,
            message: "Neboli poskytnuté žiadne polia na aktualizáciu"
        });



    console.log("validating payload", req.body);
    console.log("updatePersonSchema", personSchema.updatePersonSchema.describe());


    if(error) 
        return res.status(400).send({ message: error.details[0].message});    
    const { fname, sname, birth, club_id, email, phone } = req.body;

    let fieldsToUpdate2 = {};
    if (fname) fieldsToUpdate.fname = fname;
    if (sname) fieldsToUpdate.sname = sname;
    if (birth) fieldsToUpdate.birth = birth;
    if (club_id) fieldsToUpdate.club = club_id;
    if (email) fieldsToUpdate2.email = email;
    if (phone) fieldsToUpdate2.phone = phone;

    try {
        const result = await personModels.updatePerson(id, fieldsToUpdate, fieldsToUpdate2);
        if (result.rowCount === 0)
            return res.status(404).send({ message: "Osoba nebola nájdená." });

        return res.status(201).send({ message: "Osoba bola úspešne aktualizovaná." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({ message: "Neočakávaná chyba na strane databázy." });
    }
};
/**
 * Backend controller for deleting a person
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: Person deleted, Code 400: Wrong request, Code 500: Database error
 */
const deletePerson = async (req, res) => {
    const { error } = personSchema.sortPersonIdSchema.validate(req.params);
    if(error)
        return res.status(400).send({ message: error.details[0].message});
    const { id } = req.params;
    try {
        const result = await personModels.deletePerson(id);
        if(result.rowCount === 0)
            return res.status(404).send({ message: "Osoba nebola nájdená." });
        return res.status(200).send({ message: "Osoba bola úspešne vymazaná." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({ message: "Neočakávaná chyba na strane databázy." });
    }
};

module.exports = { getPerson, getPersonWithoutClub, getPersonByID, createPerson, editPerson, deletePerson };