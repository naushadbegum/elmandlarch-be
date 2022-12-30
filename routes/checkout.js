const express = require('express');
const router = express.Router();

const CartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


router.get('/', async(req,res)=> {
    const cart = new CartServices(req.session.user.id);

    let cartItems = await cart.getCart();

    let lineItems = [];
    let meta = [];
    for (let cartItem of cartItems){
        console.log(cartItem);
    }
})


module.exports = router;