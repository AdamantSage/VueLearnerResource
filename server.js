const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const promisePool = require("./models/db")
const indexRouter = require('./routes/index')

//setting view engine which is ejs
app.set('view engine', 'ejs')
//views will come from a views dir
app.set('views',__dirname + '/views')

//
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))



app.use('/', indexRouter)


const testDBConnection = async () => {
    try{
        await promisePool.execute('SELECT 1');
        console.log('Database connected successfully');
    }
    catch(error){
        console.error("Error connecting to the database", error.message)
    }
}

testDBConnection();

app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running on port", process.env.PORT || 5000);
    console.log("http://localhost:5000/");
});