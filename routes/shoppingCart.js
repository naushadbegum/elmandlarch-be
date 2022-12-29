const express = require("express");
const router = express.Router();

const {getCurrentStock,
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem} = require('../services/cart_services');

router.get('/', async(req,res)=>{
    const cart = await getCart(req.session.user.id);
    return res.render('carts/index',{
        'shoppingCart': cart.toJSON()
    })
})

router.get('/:variant_id/add', async function (req, res) {
    const userId = req.session.user.id;
    const variantId = req.params.variant_id;
    const quantity = req.body.quantity;

    await addToCart(
        userId,
        variantId,
        quantity
    );
    req.flash("success_messages", "The item has been added");
    res.redirect('/cart/');
})


router.get('/:variant_id/remove', async (req,res)=> {
    const userId = req.session.user.id;
    const variantId = req.params.variant_id;

    await removeCartItem(userId, variantId)

    res.flash("success_messages", 'Item has been removed');
    res.redirect('/cart/');
})

router.put('/:variant_id/update', async (req,res) => {
    const userId = req.session.user.id;
    const variantId = req.params.variant_id;
    const quantity = req.body.quantity;

    await updateCartItem(
        userId, 
        variantId,
        quantity
    )
})

module.exports = router;