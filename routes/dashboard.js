const express = require('express')
const router = express.Router();
const promisePool = require("../models/db");


//get all info on dashboard
router.get('/', async (req,res) => {

   try{
    const [results] = await promisePool.execute('SELECT * FROM resources');
    res.render('dashboard/index', {resources: results });
   }catch(err){
    console.error("Error fetching reosurces: ", err.message);
    res.status(500).send('Error fetching resources');
   }
});

//new resource, video/bursary info
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

module.exports = router