const mongoose = require('mongoose');

const statementschema = new mongoose.Schema({
    trans_id: {
        type: String,
        required: true
    },
    trans_desc: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: {
        type: Number
    },
    type: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Statement = mongoose.model('statement', statementschema);

module.exports = Statement;