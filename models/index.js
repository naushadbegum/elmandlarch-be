const bookshelf = require('../bookshelf');

const Brand = bookshelf.model('Brand', {
    tableName: 'brands',
    luggages() {
        return this.hasMany('Luggage');
    }
});

const Material = bookshelf.model('Material', {
    tableName: 'materials',
    luggages(){
        return this.hasMany('Luggage');
    }
});

const Type = bookshelf.model('Type', {
    tableName: 'types',
    luggages(){
        return this.belongsToMany('Luggage');
    }
})

const Dimension = bookshelf.model('Dimension',{
    tableName: 'dimensions',
    variants(){
        return this.hasMany('Variant');
    }
})

const Color = bookshelf.model('Color', {
    tableName: 'colors',
    variants(){
        return this.hasMany('Variant');
    }
});

const OrderStatus = bookshelf.model('OrderStatus', {
    tableName: 'order_statuses',
    orders(){
        return this.hasMany('Order')
    }
});

const Role = bookshelf.model('Role',{
    tableName: 'roles',
    users(){
        return this.hasMany('User')
    }
});

const Luggage = bookshelf.model('Luggage', {
    tableName: 'luggages',
    brand(){
        return this.belongsTo('Brand');
    },
    material(){
        return this.belongsTo('Material');
    },
    types(){
        return this.belongsToMany('Type');
    },
    variants(){
        return this.hasMany('Variant');
    }
});

const Variant = bookshelf.model('Variant', {
    tableName: 'variants',
    color(){
        return this.belongsTo('Color');
    },
    dimension(){
        return this.belongsTo('Dimension');
    },
    luggage(){
        return this.belongsTo('Luggage');
    },
    cartItems(){
        return this.hasMany('CartItem');
    },
    orderItems(){
        return this.hasMany('OrderItem');
    }
});

const User = bookshelf.model('User',{
    tableName: 'users',
    role(){
        return this.belongsTo('Role');
    },
    cartItems(){
        return this.hasMany('CartItem');
    },
    orders(){
        return this.hasMany('Order');
    }
});

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    user(){
        return this.belongsTo('User');
    },
    variant(){
        return this.belongsTo('Variant');
    }
});

const Order = bookshelf.model('Order', {
    tableName: 'orders',
    user(){
        return this.belongsTo('User');
    },
    orderStatus(){
        return this.belongsTo('OrderStatus');
    },
    orderItems(){
        return this.hasMany('OrderItem');
    }
});

const OrderItem = bookshelf.model('OrderItem',{
    tableName: 'order_items',
    variant(){
        return this.belongsTo('Variant');
    },
    order(){
        return this.belongsTo('Order');
    }
});

const BlacklistedToken = bookshelf.model('BlacklistedToken', {
    tableName: 'blacklisted_tokens',
});

module.exports = { 
    Brand, 
    Material, 
    Type, 
    Dimension, 
    Color,
    OrderStatus,
    Role,
    Luggage, 
    Variant, 
    User, 
    CartItem, 
    Order, 
    OrderItem,
    BlacklistedToken
};