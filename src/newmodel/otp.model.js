/*
id,username, name, email, role, BirthDateTime, password
*/

const mongoose = require("mongoose");

const otpsch = new mongoose.Schema({
    phone_number: String,
    otp: String
    
}, {
    timestamps: true
})

const Otp = mongoose.model("otp", otpsch);

module.exports = Otp;