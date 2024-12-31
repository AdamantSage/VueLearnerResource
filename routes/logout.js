const express = require('express');
const router = express.Router();


const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming 'Bearer <token>' format

    if (!token) {
        return res.status(403).send('Access denied');
    }

    jwt.verify(token, 'secret-key', (err, user) => {
        if (err) {
            return res.status(403).send('Invalid token');
        }
        req.user = user; // Attach the user information to the request
        next();
    });
}

module.exports = router;
