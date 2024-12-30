const express = require('express');
const router = express.Router();
const promisePool = require("../models/db");


//get all documents
router.get('/', (req, res) => {
    res.send("Get all documents");


});

router.post('/', async (req, res) => {
    res.send("Post documents");

    console.log(req.body);

    let { title, description, file_data } = req.body;

    if (!title || !description || !file_data) {
        return res.status(400).send("Missing Fields required");
    }

    const query = 'INSERT INTO documents (title,description,file_data) VALUES (?,?,?)';

    try {
        const result = await promisePool.execute(query, [title, description, file_data]);
        console.log("Insert result successful:", result);
        res.redirect('/');

    } catch (err) {
        console.error("Error inserting documents: ", err.message);
        res.status(500).send('Error inserting documents');
    }
});

//for deleting documents
router.delete('/:id', async (req, res) => {
    try {
        const docId = req.params.id;  // Get the bursary ID from the URL parameters

        // Check if the bursary exists
        const [rows] = await promisePool.execute('SELECT * FROM documents WHERE id = ?', [docId]);
        
        if (rows.length === 0) {
            return res.status(404).send('video not found');
        }

        // Delete the bursary
        await promisePool.execute('DELETE FROM documents WHERE id = ?', [docId]);

        res.redirect('/');

    } catch (err) {
        console.error("Error deleting documents:", err.message);
        res.status(500).send('Error deleting documents');
    }
});


module.exports = router;