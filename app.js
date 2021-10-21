const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');

const jokulRoutes = require('./api/routes/jokul');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())

//route
app.use('/', jokulRoutes);

module.exports = app
