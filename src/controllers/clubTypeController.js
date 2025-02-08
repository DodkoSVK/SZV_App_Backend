const clubTypeModel = require('../models/clubTypeModel');
const clubTypeSchema = require('../schemas/clubTypeSchema');

/**
 * Backend controller for getting club types from the DB
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: All data retrieved or the empty DB, Code 500: Database error
 */
const getClubType = async (req, res) => {
    try {
        const result = await clubTypeModel.selectClubTypes();
        if(result.rows.length < 1)
            return res.status(500).send({ message: "V databáze sa nenachádzajú žiadne typy klubov"});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};
/**
 * Backend controller for creating a new club type
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 200: Club type created, Code 400: Wrong request, Code 500: Database error
 */
const createClubType = async (req, res) => {
    const { error } = clubTypeSchema.clubTypeSchema.validate(req.body);
    if(error)
        return res.status(400).send({ message: error.details[0].message});

    const { club_type } = req.body;
    try {
        const result = await clubTypeModel.intertClubType(club_type);
        if(result.rows.length < 1)
            return res.status(500).send({ message: "Nebolo mozno zapisat typ klubu do databázy"});

        return res.status(201).send({message: `Typ klubu vytvoreny s ID: ${result.rows[0].id}`});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};
/**
 * Backend controller for deleting a club type
 * @param {*} req 
 * @param {*} res 
 * @returns -> Code 201: Club type deleted, Code 500: Database error
 */
const deleteClubType = async(req, res) => {
    const { id } = req.params;
    try {
        const result = await clubTypeModel.deleteClubTypeDB(id);
        if(result.rows.length < 1)
            return res.status(500).send({ message: "Nebolo mozno vymazat typ klubu z databázy"});

        return res.status(201).send({message: "Typ klubu bol úspešne odstránený z databázy"});
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};

module.exports = { getClubType, createClubType, deleteClubType}