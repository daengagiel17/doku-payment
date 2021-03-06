const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');

const jokulRoutes = require('./api/routes/jokul');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

app.use(cors())

//route
app.use('/', jokulRoutes);

module.exports = app
