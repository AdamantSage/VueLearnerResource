const express = require('express');
const router = express.Router();
//const checkRole = require('../middleware/role');
const bcrypt = require('bcrypt');
const db = require("../models/db");

// to get register index page
router.get('/', (req,res) =>{
    res.render('register/index');
});


router.post('/', (req, res) => {
    console.log('Login request received');
    
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Query to find the user by email
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log('Database error:', error);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            console.log('No user found with that email');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        console.log('User found:', user.email);

        // Compare the provided password with the stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Bcrypt comparison error:', err);
                return res.status(500).send('Server error');
            }

            console.log('Bcrypt comparison result:', isMatch); // Log the result of comparison

            if (isMatch) {
                console.log('Password match');

                // Generate JWT with user_id included in the payload
                const token = jwt.sign(
                    { id: user.user_id, email: user.email, role: user.role }, 
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Log the token to the console
                console.log('Generated JWT:', token);

                // Set the JWT token as a cookie or return it in the response as needed
                res.cookie('token', token, { httpOnly: true, secure: false }); // Set a cookie with JWT (if desired)

                // Emit notification for successful login
                emitNotification('user_logged_in', { email: user.email, role: user.role });

                // Redirect the user to the dashboard
                return res.redirect('/dashboard');
            } else {
                console.log('Password mismatch');
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        });
    });
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