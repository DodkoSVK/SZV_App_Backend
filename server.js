const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();
const https = require('https');
const fs = require('fs');
//middlewares
const { logger } = require('./src/middlewares/logger');
//routers import
const clubRouters = require('./src/routes/clubRouter');
const clubTypeRouters = require('./src/routes/clubTypeRouter');
const personRouters = require('./src/routes/personRouter');


const app = express();
const port = process.env.PORT_BACKEND;
/* const secureOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/app.vzpieranie.sk/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/app.vzpieranie.sk/fullchain.pem')
}
 */
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
/* https.createServer(secureOptions, app).listen(port, () => {
    console.log(`My SZV application is running on https://app.vzpieranie.sk:${port}`);
}); */
app.listen(port, () => {
    console.log(`🟢 My SZV App backend run on port: ${port}`);
});