const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const promisePool = require("./models/db");
const path = require('path');
const indexRouter = require('./routes/index');
const dashRouter = require('./routes/dashboard');
const bodyParser = require('body-parser');
const bursRouter = require('./routes/bursaries');
const docRouter = require('./routes/documents');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
//session to identify diff type of users and what they see
const session = require('express-session');
const methodOverride = require('method-override');

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout'); // Layout file
app.use(methodOverride('_method'));
app.use(expressLayouts);
app.use(express.static('public'));

app.use(session({
    secret: 'secret-key',
    resave: false,            
    saveUninitialized: true,   
    cookie: { secure: false }  
}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true }))
app.use(bodyParser.json({ limit: '10mb' }));

//passing user role globally
app.use((req,res,next) =>{
    res.locals.userRole = req.user ? req.user.role : null;
    next();
});

// Routes
app.use('/', indexRouter);
app.use('/dashboard', dashRouter); // Dashboard route
app.use('/bursaries', bursRouter);
app.use('/documents', docRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
// Test DB connection
const testDBConnection = async () => {
    try {
        await promisePool.execute('SELECT 1');
        console.log('Database connected successfully');
    } catch (error) {
        console.error("Error connecting to the database", error.message);
    }
};

testDBConnection();

// Start server
app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running on port", process.env.PORT || 5000);
    console.log("http://localhost:5000/");
});
