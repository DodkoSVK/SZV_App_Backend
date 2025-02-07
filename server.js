const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();
//middlewares
const { logger } = require('./src/middlewares/logger');
//routers import
const clubRouters = require('./src/routes/clubRouter');
const clubTypeRouters = require('./src/routes/clubTypeRouter');
const personRouters = require('./src/routes/personRouter');


const app = express();
const port = process.env.PORT_BACKEND;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Custom middlewares
app.use(logger);
//routers use
app.use('/api/club/type', clubTypeRouters);
app.use('/api/club', clubRouters);
app.use('/api/person', personRouters);

app.get('*', (req, res) => {
    res.status(404).send({message: `Stranka ${req.originalUrl} neexistuje`});
});
app.listen(port, () => {
    console.log(`🟢 My SZV App backend run on port: ${port}`);
});