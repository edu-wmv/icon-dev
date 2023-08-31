"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express = require("express");
const app = express();
const db = require('./query');
<<<<<<< HEAD
const port = 3000;
//app.use(express.static('public'));
app.use(express.json());
=======
const port = process.env.PORT;
app.use(express.static('public'));
>>>>>>> 35817ab78bf8d78817a68b2023f1ac7f197cec6b
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
app.get("/", (req, res) => {
    res.send("Using server");
});
app.post("/test", db.test);
app.post("/insertData", db.insertData);
app.post("/setPoint", db.setPoint);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running on port ${port}`);
});
