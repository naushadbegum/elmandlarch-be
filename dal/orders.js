const { Order, OrderItem, OrderStatus } = require('../models');

const addOrder = async function (orderData){
    const order = new Order(orderData);
    await order.save();
    return order;
};

const addOrderItem = async function (orderItemData) {
    const orderItem = new OrderItem(orderItemData);
    await orderItem.save();

    return orderItem;
}

const getAllOrders = async function () {
    const orders = await Order.collection().orderBy('id', 'DESC').fetch({
        required: false,
        withRelated: [
            'user',
            'orderStatus',
        ]
    });
    return orders;
}

const getAllOrderStatuses = async function () {
    const orderStatuses = await OrderStatus.fetchAll().map((status) => {
        return [status.get('id'), status.get('order_status')];
    })

    return orderStatuses;
}

const filterOrdersBySearchFields = async function (form){
    let query = Order.collection();

    if(form.data.id) {
        query.where('id', '=', form.data.id)
    }

    if(form.data.order_status_id && form.data.order_status_id !=0){
        query.where('order_status_id', '=', form.data.order_status_id);
    }

    if(form.data.customer_email) {
        if(process.env.DB_DRIVER == 'mysql'){
            query.query('join', 'users', 'users.id', 'user_id')
            .where('name', 'like', `%${form.data.customer_email}%`);
        } else {
            query.query('join', 'users', 'users.id', 'user_id')
            .where('email', 'ilike', `%${form.data.customer_email}%`);
        }
    }

    let orders = await query.fetch({
        withRelated: ['user', 'orderStatus']
    });
    console.log("this", orders.toJSON());
    return orders
}



const getOrderById = async function (orderId){
    const order = await Order.where({
        id: orderId
    }).fetch({
        require: true,
        withRelated: [
            'user',
            'orderStatus',
        ]
    });
    return order;
}

const updateOrder = async function (orderId, orderData){
    const order = await getOrderById(orderId);
    const {order_status_id} = orderData;

    order.set('order_status_id', order_status_id);
    await order.save();
    return true;
}

const getAllOrdersByUserId = async function (userId) {
    const orders = await Order.collection()
    .where({
        user_id: userId
    }).orderBy('id', 'desc')
    .fetch({
        require: false,
        withRelated: [
            'user',
            'orderStatus',
            'orderItems',
            'orderItems.variant'
        ]
    })
    return orders;
}

module.exports = {
    addOrder,
    addOrderItem,
    getAllOrders,
    getAllOrderStatuses,
    filterOrdersBySearchFields,
    getOrderById,
    updateOrder,
    getAllOrdersByUserId
}