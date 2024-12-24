
const promisePool = require("./db");

async function findVidById(resourceID) {
    console.log("Searching for resources with ID:", resourceID); // Log the bursary ID being searched for
    const query = 'SELECT * FROM resources WHERE id = ?';
    const [rows] = await promisePool.execute(query, [resourceID]);

    console.log("Query result:", rows); // Log the query result

    return rows.length > 0 ? rows[0] : null; // Return the bursary or null if not found
}


module.exports = { findVidById };
