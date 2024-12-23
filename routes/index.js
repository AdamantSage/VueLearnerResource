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

        // Pass resources and bursaries to the view, including searchOptions without displaying search UI in index
        const searchOptions = req.query.name || ""; // This will be passed but not used for search UI in index

        res.render('dashboard/index', { resources, bursaries, searchOptions });
    } catch (err) {
        console.error("Error fetching data:", err.message);
        res.status(500).send("An error occurred while loading the dashboard page.");
    }
});

module.exports = router;
