const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    _id:String,
    rest_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    address: String,
    pick_up_time: String,
    is_accepted: {
        type: Boolean,
        default: false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    details: [{
        menu_id:String,
        item_id: String,
        additions: [{
            addition_id: String,
            selected: [{
                _id: String,
                quantity: Number
            }]
        }],
        quantity: Number,
        amount: Number
    }],
    order_status: {
        type: String,
        default: "placed"
    },
    is_complete: {
        type: Boolean,
        default: false
    },
    curbside: [{
        model: String,
        platenumber: String,
        make: String,
        color: String
    }],
    order_time:String,
    order_type: String, //{Delivery, PickUp, Curbside}
    order_amount: Number,
    transaction_id: {
        type: String,
        default: null
    },
    recurring: {
        recurring_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'recurring'
        }
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

const Order = mongoose.model('order', orderSchema);

module.exports = Order;