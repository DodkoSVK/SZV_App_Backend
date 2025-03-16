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
        const result = await competitionModel.selectAllCompetitions(sortBy);
        if(result.rows.length < 1)
            return res.status(200).send({message: "V databáze sa nenachádzajú žiadne súťaže"});

        return res.status(200).json(result.rows);
    } catch (e) {
        console.log(`🟠 We got a problem: ${e}`);
        return res.status(500).send({message: "Neocakavana chyba na strane databazy."});
    }
}