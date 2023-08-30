"use strict";
require('dotenv').config();
const mysql = require('mysql');
const production = {
    host: process.env.DB_HOST_PROD,
    user: process.env.DB_USER_PROD,
    password: process.env.DB_PASS_PROD,
    database: process.env.DB_NAME_PROD,
    port: process.env.DB_PORT_PROD
};
const pool = mysql.createPool(production);
module.exports = pool;
