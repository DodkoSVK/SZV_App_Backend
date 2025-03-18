const competitionModel = require('../models/competitionModel');
const competitionSchema = require('../schemas/competitionSchema');

const getCompetition = async (req, res) => {
    const { sortBy } = req.query;
    if (sortBy) {
        const { error } = competitionSchema.sortCompetitionSchema.validate({ sortBy });
        if(error)
            return res.status(400).send({ message: error.details[0].message });
    }    
    try {
        const result = await competitionModel.selectCompetition(sortBy);
        if(result.rows.length < 1)
            return res.status(200).send({message: "V databáze sa nenachádzajú žiadne súťaže"});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
};

const searchCompetition = async (req, res) => {
    const { searchBy } = req.body;
    if (!searchBy)
        return res.status(400).send({ message: "Neboli zadané žiadne parametre pre vyhľadávanie"});

    const { error } = competitionSchema.searchCompetitionSchema.validate({ searchBy });
    if(error)
        return res.status(400).send({ message: error.details[0].message });
    try {
        const result = await competitionModel.searchCompetition(searchBy);
        if(result.rows.length < 1)
            return res.status(200).send({message: "V databáze sa nenachádzajú žiadne súťaže"});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
}

const createCompetition = async (req, res) => {
    const { error } = competitionSchema.createCompetitionSchema.validate(req.body);
    if(error)
        return res.status(400).send({ message: error.details[0].message });

    const { year, date, round, league, groups } = req.body;
    try {
        // 1. Create "competition" and get "competition::id"
        const competition_id = await competitionModel.insertCompetition(year, league, round);
        if(competition_id.rows.length < 1)
            return res.status(500).send({message: "Nepodarilo sa vytvoriť súťaž"});
        // 2. Create "comptitions locations"
        for (const group of groups) {
            const { group_name, city, club } = group;
            const result = await competitionModel.insertCompetitionLocation(competition_id.rows[0].competition_id, group_name, city, date, club);
            if(result.rows.length < 1)
                return res.status(500).send({message: "Nepodarilo sa vytvoriť skupinu súťaže"});
        }        
        return res.status(201).send({ message: "Súťaž a skupiny boli úspešne vytvorené." });
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
        
    }

   
}
module.exports = { getCompetition, searchCompetition, createCompetition };