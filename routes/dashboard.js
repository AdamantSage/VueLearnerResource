const express = require('express')
const router = express.Router();
const promisePool = require("../models/db");
const {findVidById} = require('../models/vidModel');


//get all info on dashboard/video
router.get('/', async (req,res) => {

    let searchOptions = "SELECT * FROM resources";
    let queryParam =[];

    //here we are searching for authors, i makes it case sensitive, so whether its caps or small itll still find it
    if(req.query.name != null && req.query.name !== ''){
        searchOptions += " WHERE title LIKE ?";
    queryParam.push(`%${req.query.name}%`);

    }

   try{
    const [results] = await promisePool.execute(searchOptions,queryParam);
    res.render('dashboard', {resources: results,
         searchOptions: req.query });
   }catch(err){
    console.error("Error fetching resources: ", err.message);
    if(!res.headersSent){
        res.status(500).send('Error fetching resources');
        res.redirect('/');
    }
    
   }
});

//new resource, video
//adds them to the database, but this must be for admin or me as the creator
router.get('/new', async (req, res) => {
    try {
        // Fetch resources or any other necessary data for the form
        const [resources] = await promisePool.execute('SELECT * FROM resources');
        res.render('dashboard/new', { resources: resources }); // Pass resources to the view
    } catch (err) {
        console.error("Error fetching resources: ", err.message);
        res.status(500).send('Error fetching resources');
    }
});

router.post('/', async (req, res) =>{

    console.log(req.body);  // This will show the form data being sent to the server

    let { title, type, link, created_at } = req.body;
    const uploaded_by ="1"; // Assuming the user's ID is stored in session

    // Set 'created_at' to NULL if it's not provided
    if (!created_at) {
        created_at = null;  // Use `null` for SQL instead of undefined
    }
    // Ensure that all required fields have values
    if (!title || !type || !link || !uploaded_by) {
        return res.status(400).send("Missing required fields");
    } 
    const query ='INSERT INTO resources (title,type,link,uploaded_by,created_at) VALUES(?,?,?,?,?)';

    try{
        const result = await promisePool.execute(query, [title,type,link,uploaded_by,created_at]);
        console.log("Insert result:",result);
        res.redirect('/dashboard');
    }
    catch(err){
        console.error("Error inserting reosurces: ", err.message);
        res.status(500).send('Error inserting resources');
       }
})

//for editing video information and link
router.get('/:id/edit', async (req, res) => {

    try{
        const resourceID = req.params.id;

        const [resource] = await promisePool.execute('SELECT * FROM resources WHERE id = ?', [resourceID]);

        if(resource.length ===0){
            return res.status(404).send('Resource not found');
        }

        res.render('./dashboard/editResource', {resource:resource[0]});
    }catch(err){
        console.error("Error updating resources: ", err.message);
        res.status(500).send('Error updating resources');
       }

});


//for finding video and updating it
router.put('/:id/edit', async (req, res) => {
    try {
        const resourceID = req.params.id;
        console.log('PUT route hit for ID:', resourceID);

        // Get current resource from the database using the findVidById function
        const existingResource = await findVidById(resourceID);
        if (!existingResource) {
            return res.status(404).send('Resource not found');
        }

        // Use existing values if no new value is provided
        const { title, type, link, created_at } = req.body;
        const updatedTitle = title || existingResource.title;
        const updatedType = type || existingResource.type;
        const updatedLink = link || existingResource.link;
        const updatedCreatedAt = created_at || existingResource.created_at;

        // Update the resource in the database
        const result = await promisePool.execute(
            'UPDATE resources SET title = ?, type = ?, link = ?, created_at = ? WHERE id = ?',
            [updatedTitle, updatedType, updatedLink, updatedCreatedAt, resourceID]
        );

        console.log('Resource updated:', result);
        res.redirect('/dashboard'); // Redirect to the dashboard after editing
    } catch (err) {
        console.error('Error updating resource:', err.message);
        res.status(500).send('Error updating resource');
    }
});


// to show videos individually by loading them to a show page using title, but backend uses id gotten from title

router.get('/:id', async (req,res) =>{

    try{
        const videoId = req.params.id;
        console.log("Video ID from params:", videoId); // Log the bursary ID
        const video = await findVidById(videoId);

        if(video){
            res.render('dashboard/show', { video});
        }
        else{
            res.status(404).send('Video not found');
        }


    }catch (err) {
        console.error("Error fetching resources/video: ", err.message);
        res.status(500).send('Error fetching resources/video');
    }

});



//for deleting 
router.delete('/:id', async (req, res) => {
    try {
        const videoId = req.params.id;  // Get the bursary ID from the URL parameters

        // Check if the bursary exists
        const [rows] = await promisePool.execute('SELECT * FROM resources WHERE id = ?', [videoId]);
        
        if (rows.length === 0) {
            return res.status(404).send('video not found');
        }

        // Delete the bursary
        await promisePool.execute('DELETE FROM resources WHERE id = ?', [videoId]);

        res.redirect('/dashboard');

    } catch (err) {
        console.error("Error deleting video:", err.message);
        res.status(500).send('Error deleting video');
    }
});

module.exports = router