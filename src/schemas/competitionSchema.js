const Joi = require("joi");

const sortCompetitionSchema = Joi.object({
    sortBy: Joi.string().valid('name', 'group_name', 'city', 'date', 'round', 'league')    
});
const searchCompetitionSchema = Joi.object({
    searchBy: Joi.object({
        name: Joi.string().optional(),
        group_name: Joi.string().optional(),
        city: Joi.string().optional(),
        date: Joi.date().iso().required(),
        round: Joi.number().optional(),
        league: Joi.string().optional()
    }).required()
});
const createCompetitionSchema = Joi.object({
    id: Joi.number().optional(),
    league_id: Joi.number().required(),
    round: Joi.number().required(),
    date: Joi.date().iso().required(),  // očakáva ISO string
    locations: Joi.array().items(
        Joi.object({
            id: Joi.number().optional(),
            group: Joi.string().required(),
            city: Joi.string().allow("").required(),
            club_id: Joi.number().required()
        })
    ).min(1).required()
});

const updateCompettionSchema = Joi.object({
    id: Joi.number().min(1),
    league_id: Joi.number(),
    round: Joi.number(),
    date: Joi.date().iso(),
    locations: Joi.array().items(
        Joi.object({
            id: Joi.number(),
            group: Joi.string(),
            city: Joi.string(),
            club_id: Joi.number()
        })
    ).min(1).required()
})

module.exports = { sortCompetitionSchema, searchCompetitionSchema, createCompetitionSchema, updateCompettionSchema };