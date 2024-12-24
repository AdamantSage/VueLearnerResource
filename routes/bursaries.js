const express = require('express')
const router = express.Router();
const promisePool = require("../models/db");
const multer = require('multer');
const path =require('path');
const upload = multer({ dest: 'public/uploads/' }); // Configure where to save the image
const imageMimeTypes =['image/jpeg','image/png','image/gif']
const fs = require('fs');

const { promisify } = require('util');
const {findBursById} = require('../models/bursaryModel');

// Create a promisified version of fs.readFile
const readFileAsync = promisify(fs.readFile);

//get all bursaries
router.get('/', async (req, res) => {
    let searchOptions = "SELECT * FROM bursaries";
    let queryParam = [];

    // Add search functionality for title
    if (req.query.title != null && req.query.title !== '') {
        searchOptions += " WHERE title LIKE ?";
        queryParam.push(`%${req.query.title}%`);
    }

    try {
        const [rows] = await promisePool.execute(searchOptions, queryParam);

        // Process each bursary to include image data
        const bursariesWithImageData = rows.map(bursary => {
            const coverImage = bursary.cover; // Binary data
            const extension = bursary.img_extension; // Image extension
            let contentType;

            // Determine content type based on the extension
            if (extension === 'jpeg' || extension === 'jpg') {
                contentType = 'image/jpeg';
            } else if (extension === 'png') {
                contentType = 'image/png';
            } else if (extension === 'gif') {
                contentType = 'image/gif';
            }

            return {
                ...bursary,
                coverImageData: coverImage ? coverImage.toString('base64') : null, // Convert binary data to base64
                contentType: contentType || 'image/jpeg', // Default to JPEG if extension is missing
            };
        });

        res.render('bursaries', { 
            bursaries: bursariesWithImageData, 
            searchOptions: req.query 
        });
    } catch (err) {
        console.error("Error fetching bursaries:", err.message);
        res.status(500).send('Error fetching bursaries');
    }
});





//new bursary route
router.get('/new', async (req, res) => {
   try{

    //provide a default empty object
    const bursary = { title: '', description: '', link: '', cover: '' };
    res.render('bursaries/new', {bursaries: bursary});
    
   }catch(err){
    console.error("error displaying", err.message);
    res.status(500).send('Error displaying form');

   }
 
});

router.post('/', upload.single('cover'), async (req, res) => {
    try {
        const { title, description, link } = req.body;
        
        // Validate file type
        if (req.file && !imageMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        }

        // Read the image file as binary (Buffer)
        const coverImage = req.file ? await readFileAsync(req.file.path) : null;

        // Insert into the database (store image as BLOB)
        await promisePool.execute(
            'INSERT INTO bursaries (title, description, link, cover) VALUES (?, ?, ?, ?)', 
            [title, description, link, coverImage]
        );

        // After successful insertion, remove the uploaded file from disk
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.redirect('/bursaries');
    } catch (err) {
        console.error("Error inserting into bursaries", err.message);
        res.status(500).send('Error inserting into bursaries');
    }
});


//geting bursary by id
router.get('/:id', (req, res) => {
    res.send('Show Bursaries '+ req.params.id);
});


//getting bursary by id for editing
router.get('/:id/edit', async (req, res) => {
    try {
        const bursaryId = req.params.id;
        console.log("Bursary ID from params:", bursaryId); // Log the bursary ID

        const bursary = await findBursById(bursaryId);
        
        if (bursary) {
            res.render('bursaries/edit', { bursary }); // Pass singular bursary
        } else {
            res.status(404).send('Bursary not found');
        }
    } catch (err) {
        console.error("Error fetching bursary:", err.message);
        res.status(500).send('Error fetching bursary');
    }
});


router.put('/:id', upload.single('cover'), async (req, res) => {
    try {
        const bursaryId = req.params.id;
        const { title, description, link } = req.body; // Get data from the body
        console.log("Bursary ID from params:", bursaryId); // Log the bursary ID

        // Fetch the existing bursary
        const bursary = await findBursById(bursaryId);
        if (!bursary) {
            return res.status(404).send('Bursary not found');
        }

        // Set default values to the existing bursary data
        let updatedTitle = title || bursary.title;
        let updatedDescription = description || bursary.description;
        let updatedLink = link || bursary.link;
        let updatedCover = bursary.cover; // Default to the existing cover image

        // If a new file is uploaded, update the cover
        if (req.file) {
            if (!imageMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).send('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            }
            updatedCover = await readFileAsync(req.file.path); // Update cover image
        }

        // Update bursary in the database
        await promisePool.execute(
            'UPDATE bursaries SET title = ?, description = ?, link = ?, cover = ? WHERE id = ?',
            [updatedTitle, updatedDescription, updatedLink, updatedCover, bursaryId]
        );

        // If a new file was uploaded, delete the old one
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.redirect('/bursaries');
    } catch (err) {
        console.error("Error updating bursary:", err.message);
        res.status(500).send('Error updating bursary');
    }
});



router.delete('/:id', async (req, res) => {
    try {
        const bursaryId = req.params.id;  // Get the bursary ID from the URL parameters

        // Check if the bursary exists
        const [rows] = await promisePool.execute('SELECT * FROM bursaries WHERE id = ?', [bursaryId]);
        
        if (rows.length === 0) {
            return res.status(404).send('Bursary not found');
        }

        // Delete the bursary
        await promisePool.execute('DELETE FROM bursaries WHERE id = ?', [bursaryId]);

        // Send success response
        res.status(200).send('Bursary deleted successfully');
        res.redirect('/bursaries');

    } catch (err) {
        console.error("Error deleting bursary:", err.message);
        res.status(500).send('Error deleting bursary');
    }
});


module.exports = router;