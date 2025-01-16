require('dotenv').config();
const mysql = require("mysql2");
const fs = require('fs');
const path = require('path');

// Resolve the CA file path
const caPath = path.resolve(__dirname, '../ca.pem');

// Check if the CA file exists
if (!fs.existsSync(caPath)) {
    console.error("CA file not found at:", caPath);
    process.exit(1);
}

// Log the resolved path
console.log("Resolved path to CA file:", caPath);

// Create the connection pool with promise support
const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.APP_PORT,
    database: process.env.DATABASE,

    ssl: {
        ca: fs.readFileSync(caPath),
    }
});

// Get the promise-based pool API
const promisePool = pool.promise();

module.exports = promisePool;
