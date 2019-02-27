const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
MongoClient = require('mongodb').MongoClient;
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express(); 

// Connected BD


// EJS   

app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: false }));


//express-session 

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
  }));




// connect flash

app.use(flash());

//global vars

app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    //res.locals.error = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// ROUTES 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));


const PORT = process.env.PORT || 5000;

app.listen(PORT,console.log('server started on port '+PORT));