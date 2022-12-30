const express = require('express');
const router = express.Router();

const CartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


router.get('/', async(req,res)=> {
    const userId = req.user.id;
    let cartItems = (await CartServices.getCart(userId)).toJSON();

// step 1: create line items

    let lineItems = [];
    let meta = [];
    for (let cartItem of cartItems){
        console.log(cartItem);

        const brand = cartItem.variant.luggage.brand.brand;
        const model = cartItem.variant.luggage.model;
        const color = cartItem.variant.color.color;
        const dimension = cartItem.variant.dimension.dimension;
        const imageUrl = cartItem.variant.image_url;

        const lineItemName = `${brand} ${model} (Color: ${color}, (Dimension: ${dimension})`;
        console.log(lineItemName);


        const lineItem = {
            'quantity': cartItem.quantity,
            'price_data': {
                'currency': 'SGD',
                'unit_amount': cartItem.variant.luggage.cost,
                'product_data':{
                    'name': lineItemName 
                }
            }
            }

        
        if (imageUrl) {
            lineItem.price_data.product_data.images = [imageUrl]
        }
        lineItems.push(lineItem);

        meta.push({
            user_id: cartItem.user_id,
            variant_id: cartItem.variant_id,
            quantity: cartItem.quantity
            
        })

        };


// step 2: create payment
        let metaData = JSON.stringify(meta);
        const payment = {
            payment_method_types: ['cards', 'paynow'],
            mode: 'payment',
            invoice_creation: {enabled: true},
            line_items: lineItems,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_ERROR_URL,
            metaData:{
                'orders': metaData
            }
        }
// step 3: send the payment to stripe
let stripeSession = await Stripe.checkout.sessions.create(payment)

res.render('checkouts/checkout',{
    'sessionId': stripeSession.id,
    'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
})
       
    }
)

router.get("/success", function (req, res){
    res.json({
        "message": "Stripe payment submitted"
    })
})

module.exports = router;