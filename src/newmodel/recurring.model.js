const mongoose = require('mongoose');

const recurSchema = new mongoose.Schema({
    status: {
        type: String,
        default: "active"
    },
    order_details: [{
        item_id: String,
        item_name:String,
        // additions: [{
        //     addition_id: String,
        //     selected: [{
        //         _id: String,
        //         quantity: Number
        //     }]
        // }],
        quantity: Number,
        amount: Number
    }],
    frequency: {
        type:String,
        day: [{
            type: String,
            open:Boolean,
            default: null
        }],
        start_time: {
            type: String,
            default: null
        },
        end_time: {
            type: String,
            default: null
        }
    },
    // frequency_type:String,
    occuranceNumber:Number,
    order_type: String,
    address: {
        address:String,
        name:String

    },
    curbside: [{
        model: String,
        platenumber: String,
        make: String,
        color: String
    }],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    rest_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    last_order_date: String
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

const recur = mongoose.model('recurring', recurSchema);

module.exports = recur;