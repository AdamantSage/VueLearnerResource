const express = require('express');
const router = express.Router();
const promisePool = require('../models/db');

router.get('/', async (req, res) => {
    try {
        // Fetch resources
        const [resources] = await promisePool.execute(
            'SELECT * FROM resources ORDER BY created_at DESC LIMIT 5'
        );

        // Fetch bursaries
        const [bursaries] = await promisePool.execute(
            'SELECT * FROM bursaries'
        );

        // Render the view and pass data to the EJS template
        res.render('index', { resources, bursaries });

    } catch (err) {
        console.error("Error fetching data:", err.message);
        res.status(500).send("An error occurred while fetching data.");
    }
});

module.exports = router;
