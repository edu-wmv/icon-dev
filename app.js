"use strict";
const express = require("express");
const mysql = require("mysql");
const uuid_1 = require("uuid");
const app = express();
const port = process.env.PORT;


// DATABASE CONNECTION
const production = {
  host: process.env.DB_HOST_PROD,
  user: process.env.DB_USER_PROD,
  password: process.env.DB_PASS_PROD,
  database: process.env.DB_NAME_PROD,
  port: process.env.DB_PORT_PROD
};
const pool = mysql.createPool(production);

// DATABASE QUERIES
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

const insertData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
  const name = req.headers['name'];
  const uid = req.headers['uid'];
  try {
      const exists = yield checkUid(uid);
      if (exists) {
          res.status(200).json({ statusCode: 200, message: `Iconico ja cadastrado`, code: 'already-exists' });
      }
      else {
          pool.query(`INSERT INTO iconicos (name, uid)
               VALUES ('${name}', ${uid})`, (error, results) => {
              if (error)
                  throw error;
              res.status(201).json({ statusCode: 201, message: `Iconico cadastrado com sucesso`, code: 'success' });
          });
      }
  }
  catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Erro interno ao verificar UID' });
  }
});
const setPoint = (req, res) => {
  const uuid = req.headers['uuid'];
  const data_time = req.headers['time'];
  // VERIFICA SE O USUARIO EXISTE
  pool.query(`SELECT * FROM iconicos 
       WHERE uid = ${uuid}`, (error, results) => {
      if (error)
          throw error;
      if (results.length > 0 && typeof results !== undefined) {
          const userId = results[0].id;
          const userName = results[0].name;
          pool.query(`SELECT * FROM pontos
                   WHERE userId = ${userId}
                   ORDER BY data DESC
                   LIMIT 1`, (error, results) => {
              if (error)
                  throw error;
              const last_point = results.length > 0 && typeof results !== undefined ? results[0].entrada : false;
              pool.query(`INSERT INTO pontos (id_ponto, userId, uuid, name, data, entrada)
                           VALUES ('${(0, uuid_1.v4)()}', ${userId}, ${uuid}, '${userName}', '${data_time}', ${!last_point})`, (error) => {
                  if (error)
                      throw error;
                  pool.query(`SELECT * FROM pontos
                                   WHERE userId = ${userId}
                                   ORDER BY data DESC
                                   LIMIT 1`, (error, results) => {
                      if (error)
                          throw error;
                      const ponto_uid = results[0].id_ponto;
                      pool.query(`UPDATE iconicos
                                           SET pontos = CONCAT_WS(IFNULL(',', ''), pontos, '${ponto_uid}')
                                           WHERE id = ${userId}`, (error) => { if (error)
                          throw error; });
                  });
              });
              if (last_point == false) {
                  res.status(200).json({ statusCode: 200, message: `Bem vindo ${userName}!`, code: 'welcome' });
              }
              else {
                  try {
                      pool.query(`SELECT * FROM pontos
                                   WHERE userId = ${userId}
                                   ORDER BY data DESC
                                   LIMIT 2`, (error, results) => {
                          if (error)
                              throw error;
                          const entrada = new Date(results[1].data);
                          const saida = new Date(results[0].data);
                          const diff = (saida.getTime() - entrada.getTime()) / 1000;
                          const time = `${toHoursAndMinutes(diff).h}:${toHoursAndMinutes(diff).m}:${toHoursAndMinutes(diff).s}`;
                          pool.query(`UPDATE iconicos
                                           SET hours = ADDTIME(hours, '${time}')
                                           WHERE id = ${userId}`, (error) => { if (error)
                              throw error; });
                          res.status(200).json({ statusCode: 200, message: `Ate logo ${userName}!`, code: 'bye' });
                      });
                  }
                  catch (error) {
                      console.log(error);
                      res.status(500).json({ statusCode: 500, message: `Erro interno`, code: 'error' });
                  }
              }
          });
      }
      else {
          res.status(200).json({ statusCode: 200, message: `Iconico nao cadastrado`, code: 'not-found' });
      }
  });
};
const checkUid = (uid) => __awaiter(void 0, void 0, void 0, function* () {
  try {
      const results = new Promise((resolve, reject) => {
          pool.query(`SELECT * FROM iconicos WHERE uid = ${uid}`, (error, results) => {
              if (error)
                  reject(error);
              resolve(results);
          });
      });
      return (yield results).length > 0 && typeof (yield results) !== undefined ? true : false;
  }
  catch (error) {
      console.log(error);
      return true;
  }
});
function toHoursAndMinutes(totalSeconds) {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { h: hours, m: minutes, s: seconds };
}

// MIDDLEWARE
app.use(express.json());
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

// ROUTES
app.post("/insertData", insertData);
app.post("/setPoint", setPoint);

// SERVER
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running on port ${port}`);
});
