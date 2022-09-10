/*
id,username, name, email, role, BirthDateTime, password
*/

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone_number: {
        type: String
    },
    addresses: [{
        name: String,
        address: String
    }],
    curbside: [{
        model: String,
        platenumber: String,
        make: String,
        color: String
    }],
    role: {
        type: String,
        default: "user"
    },
    rest_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant'
    }
}, {
    timestamps: true
})

const User = mongoose.model("user", UserSchema);

module.exports = User;