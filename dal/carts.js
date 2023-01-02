const { CartItem } = require('../models');

const getCartByUserId = async function (userId) {
    const cartItems = await CartItem.collection()
    .where({
        'user_id': userId
    }).orderBy('id')
    .fetch({
        require: false,
        withRelated: [
            'user',
            'variant',
            'variant.color',
            'variant.dimension',
            'variant.luggage',
            'variant.luggage.material',
            'variant.luggage.brand',
            'variant.luggage.types'
        ]
    });
    return cartItems;
}

const getCartItemByUserAndVariant = async function (userId, variantId){
    const cartItem = await CartItem.where({
        'user_id': userId,
        'variant_id': variantId
    }).fetch({
        require: false
    });
    return cartItem;
}

const createCartItem = async function (userId, variantId, quantity){
    const cartItem = new CartItem({
        'user_id': userId,
        'variant_id': variantId,
        'quantity': quantity
    })
    console.log(cartItem);
    await cartItem.save();
    return cartItem;
}

const removeCartItem = async function (userId, variantId){
    const cartItem = await getCartItemByUserAndVariant(userId, variantId);

    if (cartItem){
        await cartItem.destroy();
        return true;
    } else {
        return false;
    }
}

const updateCartItem = async function (userId, variantId, quantity){
    const cartItem = await getCartItemByUserAndVariant(userId, variantId);
    
    if(cartItem){
        cartItem.set('quantity', quantity);
        await cartItem.save();
        return true;
    } else {
    return false;
    }
}



module.exports= {getCartByUserId, getCartItemByUserAndVariant, createCartItem, removeCartItem, updateCartItem}