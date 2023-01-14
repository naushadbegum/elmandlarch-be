const express = require("express");
const router = express.Router();
const dataLayer = require('../dal/users');

// import in the User model
const { User } = require('../models');

const { createRegistrationForm, createLoginForm, bootstrapField } = require('../forms');

const crypto = require('crypto');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}
router.get('/register', (req,res)=>{
    // display the registration form
    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    console.log(process.env);
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async (form) => {
            const {confirm_password, ...userData} = form.data;
            const user = await dataLayer.addUser(userData, 2);
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login',{
        'form': loginForm.toHTML(bootstrapField)
    })
})


router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login

            // ...find the user by email and password
            let user = await User.where({
                'email': form.data.email
            }).fetch({
               require:false}
            );

            if (!user) {
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                res.redirect('/users/login');
            } else {
           
                if (user.get('password') === getHashedPassword(form.data.password)) {
             
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('username'));
                    res.redirect('/luggages');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                    res.redirect('/users/login')
                }
            }
        }, 'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile', function(req,res){
  const user = req.session.user;
  res.render('users/profile',{
    'user': user
  })
})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "You have been logged out successfully!");
    res.redirect('/users/login');
})

module.exports = router;