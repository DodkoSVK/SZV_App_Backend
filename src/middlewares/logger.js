const logger = (req, res, next) => {
    console.log(`🟡 New request: ${req.method}, requested URL: ${req.originalUrl}, body: ${JSON.stringify(req.body)}`);
    next();
};

module.exports = {logger};