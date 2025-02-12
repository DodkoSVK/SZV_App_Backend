const Joi = require("joi");

const clubTypeSchema = Joi.object({
    club_type: Joi.string().required(),
    club_short: Joi.string().required()
});

module.exports = { clubTypeSchema };