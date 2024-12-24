const promisePool = require("./db");

async function findBursById(bursID) {
    console.log("Searching for bursary with ID:", bursID); // Log the bursary ID being searched for
    const query = 'SELECT * FROM bursaries WHERE id = ?';
    const [rows] = await promisePool.execute(query, [bursID]);

    console.log("Query result:", rows); // Log the query result

    return rows.length > 0 ? rows[0] : null; // Return the bursary or null if not found
}

module.exports = { findBursById };
