const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(session({
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(flash())

app.use(function (req,res,next){
  res.locals.success_messages= req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
})

const landingRoutes = require('./routes/landing');
const luggageRoutes = require('./routes/luggages');
const cloudinaryRoutes = require('./routes/cloudinary');
const userRoutes = require('./routes/users')

async function main() {
    app.use('/', landingRoutes);
    app.use('/luggages', luggageRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/users', userRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});