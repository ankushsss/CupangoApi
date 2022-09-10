const mongoose = require("mongoose");

const astrologerschema = new mongoose.Schema({

    name: String,
    work_location: String,
    languages: [String],
    image_url: String,
    cover_url: String,
    rating: Number,
    qualification: String,    
    number_of_ratings: Number,
    phone_number: {
        type: String,
        default: null
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    field_changed: {
        type: String,
        default: null
    },
    profile_percentage: Number,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    experience: String,
    certifications: [{
        certificateName: String,
        certifiacte_url: String
    }],
    expertise: [String],
    special_skills: [String],
    about: String,
    rates: [{
        mode: {
            type: String
        },
        rate: {
            type: Number
        }
    }],
    channelID: Number,
    status: {
        type: String,
        default: "100000"
    }, //[live,offline,suspended,deleted]
    calender: [{
        day: String,
        start_time: String,
        end_time: String
    }],
}, {
    timestamps: true
});

const Expert = mongoose.model("experts", astrologerschema);

module.exports = Expert;