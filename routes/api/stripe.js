const express = required('express');
const router = express.Router();
const orderDataLayer = require('../../dal/orders');
const luggageDataLayer = require('../../dal/luggages');
const cartServices = require('../../services/cart_services');

const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


router.post(
    '/process_payment',
    express.raw({ type: 'application/json'}),
    async function (req, res){
        let payload = req.body;
        let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
        let sigHeader = req.headers['stripe-signature'];
        let event = null;
            event = Stripe.webhooks.contructEvent(
                payload,
                sigHeader,
                endpointSecret
            );
            if (
                event.type == 'checkout.session.completed' ||
                event.type == 'checkout.session.async_payment_succeeded'
            ) {

                let stripeSession = event.data.object;

                const metadata = JSON.parse(event.data.object.metadata.orders);

                const userId = metadata[0].user_id;

                const paymentIntent = await Stripe.paymentIntents.retrieve(
                    stripeSession.payment_intent
                    );
                const chargeId = paymentIntent.charges.data[0].id;

                const charge = await Stripe.charges.retrieve(chargeId);
                const payment_url = charge.payment_url;
                const payment_type = charge.payment_method_details.type;
                // const shippingRate = await Stripe.shippingRates.retrieve(
                //     stripeSession.shipping_rate
                // );
                const orderData = {
                    total_cost : stripeSession.amount_total,
                    user_id: userId,
                    order_status_id : 3,
                    payment_type: payment_type,
                    payment_url: payment_url,
                    order_date: new Date(charge.created * 1000),
                    payment_intent: stripeSession.payment_intent,
                    shipping_address_line1: stripeSession.shipping.address.line1,
                    shipping_address_line2: stripeSession.shipping.address.line2,
                    shipping_postal_code: stripeSession.shipping.postal_code
                
                };

                const order = await orderDataLayer.addOrder(orderData);
                const orderId = order.get('id');

                for (let lineItem of metadata) {
                    const variantId = lineItem.variant_id;
                    const quantity = lineItem.quantity;
                    const orderItemData = {
                        order_id: orderId,
                        quantity: quantity,
                        variant_id: variantId
                    };
                    await orderDataLayer.addOrderItem(orderItemData);
                    const stock = await cartServices.getCurrentStock(variantId);
                    await luggageDataLayer.updateVariant(variantId, {
                        stock: stock - quantity
                    }); 
                    }
                    res.send(await cartServices.emptyCart(userId));
                }
            }
)

module.exports = router;
