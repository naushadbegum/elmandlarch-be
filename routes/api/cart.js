const express = require("express");
const router = express.Router();
const cartServices = require('../../services/cart_services');

router.get('/', async(req,res)=>{
    
    const cartItems = await cartServices.getCart(req.session.user.id);
    console.log(req.session.user.id);
    // cartItems = response.toJSON()
    res.json(cartItems)
})

router.get('/:variant_id/add', async function (req, res) {
    const userId = req.session.user.id;
    const variantId = req.params.variant_id;
    const quantity = req.body.quantity;

    let addCart = await cartServices.addToCart(
        userId,
        variantId,
        quantity
    );

    if(addCart) {
        res.json({
            'success': 'Item has been added'
        })
    } else {
        res.status(400)
        res.json({
            'error': 'Item has not been added'
        })
    }
})


router.put('/:variant_id/update', async (req,res) => {
    const userId = req.user.id;
    const variantId = req.params.variant_id;
    const quantity = req.body.quantity;

    let updateItem = await cartServices.updateCartItem(
        userId, 
        variantId,
        quantity
    );
    if (updateItem) {
        res.json({
            'success': 'quantity added'
        })
    } else {
        res.json({
            'error': 'quantity not updated'
        })
    }
})

router.get('/:variant_id/remove', async (req,res)=> {
    const userId = req.user.id;
    const variantId = req.params.variant_id;

    await cartServices.removeCartItem(userId, variantId)

    res.json({
        'success': 'cart item removed'
    })
})

module.exports = router;