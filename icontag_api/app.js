"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ silent: true });
const express = require("express");
const app = express();
const logger = require('morgan');
const db = require('./query');
const port = process.env.PORT;
app.use(logger('dev'));
app.use(express.static('public'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, API-Key");
    next();
});
app.use((req, res, next) => {
    const api_key = req.headers['api-key'];
    if (!api_key || api_key != process.env.API_KEY) {
        res.status(401).send('Unauthorized');
    }
    else {
        next();
    }
});
app.post("/insertData", db.insertData);
app.post("/setPoint", db.setPoint);
app.listen(port, () => { console.log(`⚡️[server]: Server is running on port ${port}`); });
