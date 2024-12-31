const express = require('express');
const router = express.Router();
//const checkRole = require('../middleware/role');
const bcrypt = require('bcrypt');
const db = require("../models/db");

// to get register index page
router.get('/', (req,res) =>{
    res.render('register/index');
});


router.post('/', async (req, res) => {
    console.log('Request body:', req.body);

    const { email, role, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);

        await db.query(
            'INSERT INTO users (email, role, password) VALUES (?, ?, ?)',
            [email, role, hashedPassword]
        );
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).send('Error registering user');
    }
});

module.exports = router;


/*
router.get('/dashboard', authenticateToken, checkRole(['admin', 'lecturer', 'student']), (req, res) => {
    if (req.user.role === 'admin') {
        res.send('Admin Dashboard Content');
    } else if (req.user.role === 'lecturer') {
        res.send('Lecturer Dashboard Content');
    } else if (req.user.role === 'student') {
        res.send('Student Dashboard Content');
    } else {
        res.status(403).send('Access denied');
    }
});
*/

/*
router.delete('/delete/:id', (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).send('User ID is required'); // Ensure user ID is provided
    }

    // Start a transaction
    db.beginTransaction((err) => {
        if (err) throw err;

        // First, delete the related records in the student table
        db.query('DELETE FROM student WHERE user_id = ?', [id], (error) => {
            if (error) {
                return db.rollback(() => {
                    console.error(`Error deleting student records for user ${id}:`, error);
                    return res.status(500).send('Error deleting user');
                });
            }

            // Now delete the user from the users table
            db.query('DELETE FROM users WHERE user_id = ?', [id], (error, results) => {
                if (error) {
                    return db.rollback(() => {
                        console.error(`Error deleting user ${id}:`, error);
                        return res.status(500).send('Error deleting user');
                    });
                }

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(`Error committing transaction for user ${id}:`, err);
                            return res.status(500).send('Error deleting user');
                        });
                    }

                    // Notify clients of user deletion
                    emitNotification('user_deleted', { id });

                    res.send('User deleted successfully');
                });
            });
        });
    });
});
*/

module.exports = router;