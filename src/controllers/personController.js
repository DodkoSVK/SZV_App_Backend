const personModels = require('../models/personModel');
const personSchema = require('../schemas/personSchema');

/**
 * Get all persons with optional sorting
 * @route GET /api/person?sortBy=first_name
 */
const getPerson = async (req, res) => {
    const { sortBy } = req.query;    

    if (sortBy) {
        const { error } = personSchema.sortPersonSchema.validate({ sortBy });
        if (error) 
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
    }

    try {
        const result = await personModels.selectPerson(sortBy);

        if (result.rows.length < 1) 
            return res.status(200).json({
                success: true,
                message: "V databáze sa nenachádzajú žiadne osoby",
                data: [],
                count: 0
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
            return res.status(200).json({
                success: true,
                message: "V databáze sa nenachádzajú žiadni ľudia bez klubu",
                data: [],
                count: 0
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
};

/**
 * Get person by ID with their contacts
 * @route GET /api/person/:id
 */
const getPersonByID = async (req, res) => {
    const { id } = req.params;
    
    const { error } = personSchema.personIdSchema.validate({ id: parseInt(id) });
    if (error) 
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });

    try {
        const result = await personModels.selectPersonById(parseInt(id));
        
        if (!result) 
            return res.status(404).json({
                success: false,
                message: "Osoba nebola nájdená"
            });

        return res.status(200).json({
            success: true,
            data: result  // Person objekt s contacts array
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
 * Create new person(s) with contacts - supports single object or array
 * @route POST /api/person
 * Body: { 
 *   first_name, last_name, birth_date, gender, club_id,
 *   contacts: [{ contact_type, contact_value }]
 * }
 */
const createPerson = async (req, res) => {
    let persons = req.body;

    // Convert single object to array for uniform processing
    if (!Array.isArray(persons)) {
        persons = [persons];
    }

    // Validate all persons before inserting any
    for (let i = 0; i < persons.length; i++) {
        const { error } = personSchema.createPersonSchema.validate(persons[i]);
        if (error) 
            return res.status(400).json({
                success: false,
                message: `Chyba v zázname osoby na pozícii ${i + 1}: ${error.details[0].message}`
            });

        // Convert club_id = 0 to null
        if (persons[i].club_id === 0) 
            persons[i].club_id = null;

        // Validate contacts array
        if (!persons[i].contacts || !Array.isArray(persons[i].contacts) || persons[i].contacts.length === 0) 
            return res.status(400).json({
                success: false,
                message: `Osoba na pozícii ${i + 1} musí mať aspoň jeden kontakt`
            });

        // Validate each contact
        for (let j = 0; j < persons[i].contacts.length; j++) {
            const contact = persons[i].contacts[j];
            
            if (!contact.contact_type || !contact.contact_value)
                return res.status(400).json({
                    success: false,
                    message: `Neplatný kontakt na pozícii ${j + 1} pre osobu ${i + 1}`
                });

            if (!['email', 'phone'].includes(contact.contact_type)) 
                return res.status(400).json({
                    success: false,
                    message: `Neplatný contact_type "${contact.contact_type}". Povolené hodnoty: email, phone`
                });
        }
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
        if (e.code === '23505') 
            return res.status(409).json({
                success: false,
                message: "Osoba s týmto kontaktom už existuje."
            });

        if (e.code === '23503') 
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
 * Update existing person and their contacts by ID
 * @route PATCH /api/person/:id
 * Body: {
 *   first_name?, last_name?, birth_date?, gender?, club_id?,
 *   contacts?: [{ contact_type, contact_value }]
 * }
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
    
    const allowedFields = ['first_name', 'last_name', 'birth_date', 'gender', 'club_id'];
    let personUpdate = {};
    
    // Build person table updates
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            if (field === 'club_id' && req.body[field] === 0) 
                personUpdate[field] = null;
            else
                personUpdate[field] = req.body[field];
        }
    });

    // Validate contacts if provided
    let contactsUpdate = null;
    if (req.body.contacts !== undefined) {
        if (!Array.isArray(req.body.contacts)) 
            return res.status(400).json({
                success: false,
                message: "Contacts musí byť array"
            });

        // Validate each contact
        for (let i = 0; i < req.body.contacts.length; i++) {
            const contact = req.body.contacts[i];
            
            if (!contact.contact_type || !contact.contact_value) 
                return res.status(400).json({
                    success: false,
                    message: `Neplatný kontakt na pozícii ${i + 1}`
                });

            if (!['email', 'phone'].includes(contact.contact_type))
                return res.status(400).json({
                    success: false,
                    message: `Neplatný contact_type "${contact.contact_type}". Povolené hodnoty: email, phone`
                });
        }
        contactsUpdate = req.body.contacts;
    }

    // Check if there's anything to update
    if (Object.keys(personUpdate).length === 0 && !contactsUpdate)
        return res.status(400).json({
            success: false,
            message: "Neboli poskytnuté žiadne polia na aktualizáciu"
        });

    try {
        const result = await personModels.updatePerson(
            parseInt(id), 
            personUpdate, 
            contactsUpdate
        );

        if (!result)
            return res.status(404).json({
                success: false,
                message: `Osoba s ID ${id} nebola nájdená`
            });
        
        return res.status(200).json({
            success: true,
            message: `Osoba s ID ${id} bola úspešne aktualizovaná`,
            data: result
        });

    } catch (e) {
        console.error(`🔴 Error in editPerson: ${e.message}`, e);
        
        if (e.code === '23505')
            return res.status(409).json({
                success: false,
                message: "Osoba s týmto kontaktom už existuje."
            });
        
        if (e.code === '23503')
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
 * Delete person and all their contacts by ID
 * @route DELETE /api/person/:id
 * Note: Contacts are deleted automatically via CASCADE
 */
const deletePerson = async (req, res) => {
    const { id } = req.params;
    
    const { error } = personSchema.personIdSchema.validate({ id: parseInt(id) });
    if (error) 
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });

    try {
        const result = await personModels.deletePerson(parseInt(id));
        
        if (result.rowCount === 0) 
            return res.status(404).json({
                success: false,
                message: "Osoba nebola nájdená"
            });

        return res.status(200).json({
            success: true,
            message: "Osoba a jej kontakty boli úspešne vymazané"
        });

    } catch (e) {
        console.error(`🔴 Error in deletePerson: ${e.message}`, e);
        return res.status(500).json({
            success: false,
            message: "Neočakávaná chyba na strane databázy."
        });
    }
};

module.exports = { 
    getPerson, 
    getPersonWithoutClub, 
    getPersonByID, 
    createPerson, 
    editPerson, 
    deletePerson 
};