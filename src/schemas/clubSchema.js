const Joi = require("joi");

const createClubSchema = Joi.object({
    name: Joi.string().required(),    
    city: Joi.string().required(),
    street: Joi.string().required(),
    postal: Joi.string().required(),
    ico: Joi.string().required(),
    mail: Joi.string().allow(''),
    tel: Joi.string().allow(''),
    chairman: Joi.number().min(1)
});

const sortClubSchema = Joi.object({
    sortBy: Joi.string().valid( 'id', 'name', 'city', 'ico', 'tel', 'chairman')
});
const sortIdSchema = Joi.object({
    id: Joi.number().min(1).required()
})

const editClubSchema = Joi.object({
    id: Joi.number().min(1),
    name: Joi.string(),    
    city: Joi.string(),
    street: Joi.string(),
    postal: Joi.string(),
    ico: Joi.string(),
    mail: Joi.string().allow(''),
    tel: Joi.string().allow(''),
    chairman_id: Joi.number().min(0),
});

module.exports = {createClubSchema, sortClubSchema, sortIdSchema, editClubSchema}