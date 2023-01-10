const express = require("express");
const router = express.Router();
const cartServices = require('../../services/cart_services');
const { checkIfAuthenticatedJWT } = require('../../middlewares')

router.get('/', checkIfAuthenticatedJWT, async(req,res)=>{
    
    const cartItems = await cartServices.getCart(req.user.id);
    // cartItems = response.toJSON()
    // res.json(cartItems)
    res.send({cartItems: cartItems})
})

router.post('/:variant_id/add', checkIfAuthenticatedJWT, async function (req, res) {
    console.log("called")
    
    const userId = req.user.id;
    console.log("userId", userId);
    const variantId = req.params.variant_id;
    console.log("variantId", variantId);
    const quantity = req.body.quantity;
    console.log("quantity", quantity);

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

router.delete('/:variant_id/remove', async (req,res)=> {

    const userId = req.user.id;
    const variantId = req.params.variant_id;

    await cartServices.removeCartItem(userId, variantId)
    res.send({
        'success': 'cart item removed'
    })
})

module.exports = router;