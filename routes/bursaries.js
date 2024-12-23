const express = require('express')
const router = express.Router();
const promisePool = require("../models/db");
const multer = require('multer');
const path =require('path');
const upload = multer({ dest: 'public/uploads/' }); // Configure where to save the image
const imageMimeTypes =['image/jpeg','image/png','image/gif']
const fs = require('fs');

const { promisify } = require('util');

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

module.exports = router;