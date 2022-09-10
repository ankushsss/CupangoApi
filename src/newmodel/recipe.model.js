const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({

    rest_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    details: [{
        item_id: String,
        additions: [{
            addition_id: String,
            selected: [{
                _id: String,
                quantity: Number
            }]
        }],
        quantity: Number,
    }],
   
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

const recipe = mongoose.model('recipe', recipeSchema);

module.exports = recipe;