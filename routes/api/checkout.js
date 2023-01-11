const express = require('express');
const router = express.Router();
const CartServices = require('../../services/cart_services');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const orderDataLayer = require('../../dal/orders');
const luggageDataLayer = require('../../dal/luggages');
const cartServices = require('../../services/cart_services');
const { checkIfAuthenticated, checkIfAuthenticatedJWT } = require('../../middlewares');

router.get('/', checkIfAuthenticatedJWT, async(req,res)=> {
    const userId = req.user.id;
    let cartItems = (await CartServices.getCart(userId)).toJSON();

// step 1: create line items

    let lineItems = [];
    let meta = [];
    for (let cartItem of cartItems){
        // console.log(cartItem);

        const brand = cartItem.variant.luggage.brand.brand;
        const model = cartItem.variant.luggage.model;
        const color = cartItem.variant.color.color;
        const dimension = cartItem.variant.dimension.dimension;
        const imageUrl = cartItem.variant.image_url;

        const lineItemName = `${brand} ${model} (Color: ${color}, (Dimension: ${dimension})`;
        // console.log(lineItemName);


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
            payment_method_types: ['card', 'paynow'],
            shipping_address_collection:{
                allowed_countries: ['SG']
            },
            mode: 'payment',
            invoice_creation: {enabled: true},
            payment_intent_data: {
                capture_method: "automatic"
            },
            line_items: lineItems,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_ERROR_URL,
            metadata:{
                'orders': metaData
            }
        }
// step 3: send the payment to stripe
let stripeSession = await Stripe.checkout.sessions.create(payment);

res.json({
    'sessionId': stripeSession.id,
    'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
})
       
    }
)

// router.get("/success", function (req, res){
//     res.json({
//         "message": "Stripe payment submitted"
//     })
// })

// router.post(
//     '/process_payment',
//     express.raw({ type: 'application/json'}),
//     async function (req, res){
//         let payload = req.body;
//         console.log("webhook called")
//         let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
//         let sigHeader = req.headers['stripe-signature'];
//         let event = null;
//             event = Stripe.webhooks.constructEvent(
//                 payload,
//                 sigHeader,
//                 endpointSecret
//             );
//             if (
//                 event.type == 'checkout.session.completed'
//             ) {

//                 const metadata = JSON.parse(event.data.object.metadata.orders);

//                 const userId = metadata[0].user_id;
                
//                 let stripeSession = event.data.object;
//                 console.log(stripeSession);

//                 const shipping_address_collection = stripeSession.shipping_details;
//                 // console.log("shipping_address_collection", shipping_address_collection);

//                 const status = stripeSession.status;
//                 // console.log("status", status);

//                 const paymentType = await Stripe.paymentIntents.retrieve(stripeSession.payment_intent)
//                 // console.log("payment Type", paymentType);

//                 const paymentMethod = paymentType.payment_method_types;

//                 const receipt = await Stripe.invoices.retrieve(
//                     stripeSession.invoice
//                 )

//                 const receiptURL = receipt.hosted_invoice_url
//                 console.log(receiptURL);

//                 const dateTime = paymentType.created;
//                 const covertDate = dateTime * 1000;
//                 const covertToTodayDate = new Date(dateTime * 1000);
//                 const deliverDateOneWeek = new Date(covertDate + 7 * 24 * 60 * 60 * 1000)
        
//                 const shippingAddressObject = {
//                     shipping_country: paymentType.shipping.address.country,
//                     shipping_address_line1: paymentType.shipping.address.line1,
//                     shipping_address_line2: paymentType.shipping.address.line2,
//                     shipping_postal_code: paymentType.shipping.address.postal_code,
//                 };

//                 const orderData = {
//                     total_cost : stripeSession.amount_total,
//                     user_id: userId,
//                     order_status_id : 3,
//                     payment_type: paymentMethod,
//                     receipt_url: receiptURL,
//                     order_date: covertToTodayDate,
//                     shipping_address_line2: shippingAddressObject.shipping_address_line2,
//                     shipping_address_line1: shippingAddressObject.shipping_address_line1,
//                     shipping_postal_code: shippingAddressObject.shipping_postal_code,
//                     shipping_country: shippingAddressObject.shipping_country,
//                     delivery_date: deliverDateOneWeek
//                 };

//                 const order = await orderDataLayer.addOrder(orderData);
//                 const orderId = order.get('id');

//                 for (let lineItem of metadata) {
//                     const variantId = lineItem.variant_id;
//                     const quantity = lineItem.quantity;
//                     const orderItemData = {
//                         order_id: orderId,
//                         quantity: quantity,
//                         variant_id: variantId
//                     };
//                     await orderDataLayer.addOrderItem(orderItemData);
//                     const stock = await cartServices.getCurrentStock(variantId);
//                     const newStock = stock - quantity;
//                     await luggageDataLayer.updateVariant(variantId, newStock); 
//                     }
//                     await cartServices.emptyCart(userId);
//                     res.send({message: "Checkout successful"});
//                 }
//             }
// )



module.exports = router;