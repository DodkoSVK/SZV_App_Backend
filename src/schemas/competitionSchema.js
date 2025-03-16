const Joi = require("joi");

const sortCompetitionSchema = Joi.object({
    sortBy: Joi.string().valid('name', 'group_name', 'city', 'date', 'round', 'league')    
});
const searchCompetitionSchema = Joi.object({
    searchBy: Joi.object({
        name: Joi.string().required(),
        group_name: Joi.string().required(),
        city: Joi.string().required(),
        date: Joi.date().required(),
        round: Joi.number().required(),
        league: Joi.string().required()
    }).required()
});

module.exports = { sortCompetitionSchema, searchCompetitionSchema };