const express = require('express');
const router = express.Router();

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Failed to logout');
        }
        res.sendStatus(200); 
    });
});

module.exports = router;
