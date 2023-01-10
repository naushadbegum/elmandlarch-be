const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const { checkIfAuthenticated, checkIfAuthenticatedJWT } = require('./middlewares');

const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

const csrf = require('csurf');
const cors = require('cors')


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

app.use(cors());

app.use(session({
  store: new FileStore(),
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(flash())

app.use(function (req,res,next){
  res.locals.success_messages= req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
})

// app.use(csrf());

const csrfInstance = csrf();
app.use(function (req,res,next){
if (req.url == '/checkout/process_payment' || req.url.slice(0,5) == "/api/"){
 console.log("route excluded")
  return next()
}else {
  // console.log("route not excluded")
csrfInstance(req, res, next)
}
});

app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
      req.flash('error_messages', 'The form has expired. Please try again');
      res.redirect('back');
  } else {
      next()
  }
});

app.use(function(req,res,next){
  if (req.csrfToken){
    res.locals.csrfToken = req.csrfToken();
  }
  next();
})


const landingRoutes = require('./routes/landing');
const luggageRoutes = require('./routes/luggages');
const cloudinaryRoutes = require('./routes/cloudinary');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/shoppingCart');
const orderRoutes = require('./routes/orders');
const checkoutRoutes = require('./routes/api/checkout');
const api = {
  luggages: require('./routes/api/luggages'),
  cart: require('./routes/api/cart'),
  users: require('./routes/api/users')
}

async function main() {
  app.use(function(req,res,next){
    res.locals.user = req.session.user;
    // console.log(res.locals);
    next();
  })
    app.use('/', landingRoutes);
    app.use('/luggages', luggageRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/users', userRoutes);
    app.use('/cart', cartRoutes);
    app.use('/orders', orderRoutes);
    app.use('/checkout', checkoutRoutes);
    app.use('/api/luggages',express.json(), api.luggages);
    app.use('/api/cart', express.json(), checkIfAuthenticatedJWT, api.cart);
    app.use('/api/users', express.json(), api.users);
}



main();




app.listen(3000, () => {
  console.log("Server has started");
});