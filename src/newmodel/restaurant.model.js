const mongoose = require("mongoose");

const restSchema = new mongoose.Schema({
    name: {
        type:String,
        default:""
    },
    address: String,
    description: String,
    image_url: {
        type: String,
        default: "https://picsum.photos/200/200"
    },
    latitude: String,
    longitude: String,
    rating: Number,
    category: [{
        type: String
    }],
    number_of_ratings: Number,
    calender: [{
        day: String,
        start_time: String,
        end_time: String
    }],
    auth_users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    available_modes: [{
        type: String
    }],
    menu: [{
        item_name: String,
        image_url: {
            type: String,
            default: "https://picsum.photos/200/200"
        },
        description: String,
        item_price: Number,
        category_name: String,
        additions: [{
            addition_name: String,
            addition_image: {
                    type: String,
                    default: "https://picsum.photos/200/200"
                },
            price: Number,
            button_type: String, 
            min_number: Number,
            max_number: Number,
        }],
        sizes: [{
            name: String,
            additional_price: String,
        }],
        tags: [{
            type: String
        }]
    }],
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
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    experience: String,
    certifications: [{
        certificateName: String,
        certificate_url: String
    }],
    about: String,
    
    status: {
        type: String

    }
    ,ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admins'
    },
    
}, {
    timestamps: true
});
restSchema.methods.getData = async function (data,cb){
    console.log(this.ownerId == data.id)
    
}
const rest = mongoose.model("restaurant", restSchema);



module.exports = rest;