// db/db.js
require('dotenv').config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.NAME,
});

// Use promise-based pool to enable async/await and execute method
const promisePool = pool.promise(); 

module.exports = promisePool; // Export the promise-based pool
