 
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        // required: [true, "Please provide email address"],
        // unique: true,
        // match: [
        //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        //   "Please provide a valid email",
        // ],
      },
      password: {
        type: String,
        default: "Cupango@123"
        // required: [true, "Please add a password"],
        // minlength: 8,
        // select: false,
      },
      role: {
        type: String,
        default: "admin"
    },
    restaurantId :{
      type: String,
    }
})


// adminSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }

//   this.password = await bcrypt.hash(this.password, 10);
// });

// JWT TOKEN
adminSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.SECRET_JWT, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// adminSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };
const Admin = mongoose.model("admins",adminSchema);

module.exports = Admin;