const express = require('express');
const router = express.Router();
//const checkRole = require('../middleware/role');
const bcrypt = require('bcrypt');
const db = require('../models/db'); // Assuming promisePool is your DB connection setup

//to get login index page
router.get('/', (req,res) =>{
    res.render('login/index');
});



router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query the database to find the user by email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            // User not found
            return res.status(401).send('Invalid email or password');
        }

        const user = rows[0];

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            
            req.session.user ={
                id:user.id,
                email:user.email,
                role: user.role
            };
            return res.redirect('/dashboard'); // Redirect to the dashboard or another page
        } else {
            // Invalid password
            return res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).send('Internal server error');
    }
});
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