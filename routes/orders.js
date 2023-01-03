const express = require('express');
const router = express.Router();
const dataLayer = require('../dal/orders');
const { createSearchOrderForm, updateOrderForm, bootstrapField } = require('../forms');

const {Order} = require('../models');

router.get('/', async function(req,res){
    const orders = await dataLayer.getAllOrders();
    
    const orderStatuses = await dataLayer.getAllOrderStatuses();
    orderStatuses.unshift([0, '-------']);

    const choices = {
        orderStatuses
    };

    const orderSearchForm = createSearchOrderForm(choices);

    orderSearchForm.handle(req, {
        success: async function (form) {
            const orders = await dataLayer.filterOrdersBySearchFields(form);
console.log(orders);
            res.render('orders/index',{
                orders: orders.toJSON(),
                form: form.toHTML(bootstrapField)
            });
        },
        error: async function(form){
            res.render('orders/index', {
                orders: orders.toJSON(),
                form: form.toHTML(bootstrapField)
            });
        },
        empty: async function(form){
            res.render('orders/index',{
                orders: orders.toJSON(),
                form: form.toHTML(bootstrapField)
            });
        }
    });
});

router.get('/:order_id/update', async function (req,res){
    const order = await dataLayer.getOrderById(req.params.order_id);

    const orderStatuses = await dataLayer.getAllOrderStatuses();

    const orderForm = updateOrderForm({
        orderStatuses
    });
    orderForm.fields.order_status_id.value = order.get('order_status_id');
    res.render('orders/update', {
        form: orderForm.toHTML(bootstrapField)
    })
})

router.post('/:order_id/update', async function (req,res) {
    const orderId = req.params.order_id;
    const order = await dataLayer.getOrderById(orderId);

    const orderStatuses = await dataLayer.getAllOrderStatuses();

    const orderForm = updateOrderForm({
        orderStatuses
    });

    orderForm.handle(req, {
        success: async function (form){
            const orderData = form.data;

            await dataLayer.updateOrder(orderId, orderData);

            req.flash('success_messages', 'Order successfully updated');
            res.redirect('/orders');

        },

        error: async function (form){
            res.render('orders/update', {
                form: form.toHTML(bootstrapField)
            });
        },
        empty: async function(form){
            res.render('orders/update',{
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;


