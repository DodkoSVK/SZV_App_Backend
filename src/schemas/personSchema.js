const Joi = require("joi");

const createPersonSchema = Joi.object({
    fname: Joi.string().required(),
    sname: Joi.string().required(),
    birth: Joi.date().required(),
    club_id: Joi.number().min(0)
});

const sortPersonSchema = Joi.object({
    sortBy: Joi.string().valid('fname', 'sname', 'birth', 'club')
});

const sortPersonIdSchema = Joi.object({
    id: Joi.number().min(1).required()
});
const updatePersonSchema = Joi.object({
    id: Joi.number().min(1),
    fname: Joi.string(),
    sname: Joi.string(),
    birth: Joi.date(),
    club_id: Joi.number().min(0)
});

module.exports = { sortPersonSchema, createPersonSchema, sortPersonIdSchema, updatePersonSchema };