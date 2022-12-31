const cartDataLayer = require('../dal/carts');
const luggageDataLayer = require('../dal/luggages');

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }
}

const getCurrentStock = async function (variantId){
    const variant = await luggageDataLayer.getVariantsByLuggageId(variantId);
    return parseInt(variant.get('stock'));
}

const getCart = async function (userId){
    const cartItems = await cartDataLayer.getCartByUserId(userId);
    return cartItems;
}

const addToCart = async function (userId, variantId, quantity){
    
    try{
    const cartItem = await cartDataLayer.getCartItemByUserAndVariant(userId, variantId);

    const stock = await getCurrentStock(variantId);

    if (cartItem){
        const currentQuantity = parseInt(cartItem.get('quantity'));
        if (currentQuantity + quantity > stock){
            return false;
        }
        await cartDataLayer.updateCartItem(
            userId,
            variantId,
            currentQuantity + quantity
        );
    } else {
        if (quantity > stock) {
            return false;
        }

        await cartDataLayer.createCartItem(userId, variantId, quantity);
    }
    return true;
} catch (e) {
    console.log(e);
    return false;
}
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

const emptyCart = async function (userId) {
    const cartItems = await getCart(userId);
    for (let cartItem of cartItems){
        const variantId = cartItem.get('variant_id');
        await deleteCartItem(userId, variantId);
    }
}

module.exports = {
    CartServices,
    getCurrentStock,
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    emptyCart
}
