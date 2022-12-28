const cartDataLayer = require('../dal/cart_items');
const luggageDataLayer = require('../dal/luggages');

const getCurrentStock = async function (variantId){
    const variant = await luggageDataLayer.getVariantsByLuggageId(variantId);
    return parseInt(variant.get('stock'));
}

const getCart = async function (userId){
    const cartItems = await cartDataLayer.getCartByUserId(userId);
    return cartItems;
}

const addToCart = async function (userId, variantId, quantity){
    const cartItem = await cartDataLayer.getCartItemByUserAndVariant(userId, variantId);

    const stock = await getCurrent
}

const updateCartItem = async function (userId, variantId, quantity){
    const stock = await getCurrentStock(variantId);

    if(quantity > stock){
        return false;
    }
    return await cartDataLayer.updateCartItem(userId, variantId, quantity);
} 

const removeCartItem = async function (userId, variantId){
    return await cartDataLayer.removeCartItem(userId, variantId);
}

module.exports = {
    getCurrentStock,
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
}
