const UserModel = require("../newmodel/user.model");
const OtpModel = require("../newmodel/otp.model");
const img = require("../controllers/images.controller");
const restModel = require("../newmodel/restaurant.model");
const statementModel = require("../newmodel/statement.model");
const orderModel = require("../newmodel/order.model");
const recipeModel = require("../newmodel/recipe.model");
const recurModel = require("../newmodel/recurring.model");
const AdminModel  = require("../newmodel/admin.model");
const mongoose = require('mongoose');
const Razorpay = require("razorpay");
const crypto = require('crypto');
const ErrorResponse = require("../utils/errorResponse.utils");
// var instance = new Razorpay({
//     key_id: 'rzp_test_iir8jNLkgq7rdC',
//     key_secret: 'NKbSmhy38GVdGPFcncTDvnBP'
// });



const axios = require('axios');

const {
    nanoid
} = require('nanoid');

const HttpException = require('../utils/HttpException.utils');
const {
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
var nf = require('node-fetch');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


async function addbalance(user_id, amount, desc) {
    var theuser = await UserModel.findOne({
        "_id": user_id
    });
    const trans_id = nanoid();
    await statementModel.create({
        trans_id: trans_id,
        user_id: user_id,
        amount: amount,
        trans_desc: desc,
        type: "CREDIT"
    });
    theuser.wallet_balance += amount;

    await theuser.save();

    return "Done";
}

async function didbalance(user_id, amount, desc) {
    var theuser = await UserModel.findOne({
        "_id": user_id
    });
    const trans_id = nanoid();
    await statementModel.create({
        trans_id: trans_id,
        user_id: user_id,
        amount: amount,
        trans_desc: desc,
        type: "DEBIT"
    });
    theuser.wallet_balance -= amount;

    await theuser.save();

    return "Done";
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports.checkapi = async (req, res) => {
    //console.log(req.body);
    console.log(req.user);
    res.status(200).json({
        message: "Success. API is working. {CUPANGO}"
    })
}

module.exports.sendOTP = async (req, res) => {
    const number = req.body.phone_number;
    console.log(number)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    console.log(client)
    try {
        const thestatus = await client.verify.services('VAe3f817813d333d5ecb8a58f4f005f371')
            .verifications
            .create({
                to: number,
                channel: 'sms'
            });
         console.log(thestatus)
        return res.status(200).json(thestatus);
    } catch (e) {
        return res.status(403).json({
            status: "error",
            data: e
        });
    }


}

module.exports.verifyOTP = async (req, res) => {
    const number = req.body.phone_number;
    const otp = req.body.otp;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    var thestatus = "";
    try {
        thestatus = await client.verify.services('VAe3f817813d333d5ecb8a58f4f005f371')
            .verificationChecks
            .create({
                to: number,
                code: otp
            });
    } catch (e) {
        return res.status(403).json({
            status: "error",
            data: e
        });
    }


    if (thestatus.status == "approved") {
        const theuser = await UserModel.findOne({
            "phone_number": number
        });
        console.log(theuser);
        if (theuser && theuser.name != null) {
            const secretKey = process.env.SECRET_JWT || "";
            const mytoken = jwt.sign({
                _id: theuser._id
            }, secretKey, {
                expiresIn: '30d'
            });
            return res.status(200).json({
                status: "success",
                message: "verified successfully",
                token: mytoken,
                is_newuser: false,
                data: theuser
            });
        }
        const useradded = await UserModel.updateOne({
            "phone_number": number
        }, {
            $set: {
                "phone_number": number,
                "name": "USER NOT CREATED",
                "email": "user@eazemeup.com",
                "role": "user"
            }
        }, {
            upsert: true
        });

        const secretKey = process.env.SECRET_JWT || "";
        const mytoken = jwt.sign({
            _id: useradded.upserted[0]._id
        }, secretKey, {
            expiresIn: '30d'
        });
        return res.status(200).json({
            status: "success",
            message: "verified successfully",
            token: mytoken,
            is_newuser: true
        });
    } else {
        return res.status(401).json({
            status: "Wrong OTP",
            data: thestatus
        });
    }


}

module.exports.editUserProfile = async (req, res) => {
    const _id = req.user._id;
    if (req.body.role) {
        delete req.body.role;
    };
    console.log(req.body);
    const theUser = await UserModel.updateOne({
        _id: _id
    }, req.body, {
        upsert: false
    });
    return res.status(201).json({
        status: "success",
        msg: "Data updated successfully"
    });
}

module.exports.getMyProfile = async (req, res) => {
    console.log(req.user)
    return res.status(200).json(req.user);
}

module.exports.editRestaurant = async (req, res) => {
    try{
    var newbody = req.body;
    //delete newbody._id;

    console.log(newbody,"hello id");
    if (req.body._id == null) {
        req.body.auth_users = [],
            req.body.auth_users.push(req.user._id);
        const thenewrest = await restModel.create(req.body);
        return res.status(200).json({
            status: "success",
            msg: "restaurant added successfully",
            data: thenewrest
        });
    } else if (req.body._id != null) {
        const therest = await restModel.findOne({
            _id: req.body._id,
        });
        if (therest.auth_users.includes(req.user._id)) {
            const theedited = await restModel.updateOne({
                "_id": req.body._id
            }, newbody);
            return res.status(200).json({
                status: "authorized",
                msg: "restaurant edited successfully"
            });
        } else
            return res.status(401).json({
                status: "unauthorized"
            });
    }
}
catch(err)
{
    console.log(err)
}
}

module.exports.getSingleRestaurant = async(req, res) =>{
    console.log(req.admin._id)
    var ownerId
    if(req.body.ownerId )
    {
          ownerId = req.body.ownerId 
    }
    else
    {
        ownerId = req.admin._id
    }

    restModel.findOne({
        ownerId: ownerId,
    }).then((data)=>{
        console.log(data,"hii")
        if(data == null)
        {
            res.status(400).json({messege:"restaurent not found"})  
        }
        else
        {
         res.status(200).json(data)
        }
    }).catch((err)=>{
        // res.status(400).json({messege:"restaurent not found"})
        console.log(err.status)
        console.log(err)
    });
}
module.exports.menuItemdelete = async(req, res) =>{
    var ownerID
    if(req.body.ownerId)
    {
        ownerID= req.body.ownerId
    }
    else
    {
        ownerID= req.admin._id
    }
    console.log(req.body)
    restModel.updateOne({"ownerId":ownerID},{$set:{"menu":req.body.restaurants}}, function (err,data)
    {
      if (err)
      {
          res.json('nope');
      }
      else
      {
          res.json('yep');
          console.log(data)
      }
    })

}
module.exports.editSingleRestaurant = async(req, res) =>{
    console.log(req.admin._id)
    console.log(req.body)
    var ownerID
    if(req.body.ownerId)
    {
        ownerID= req.body.ownerId
    }
    else
    {
        ownerID= req.admin._id
    }
    // restModel.findOneAndUpdate({
    //     ownerId: req.admin._id,
    // },).
    if(req.body.type == "basic")
    {
        restModel.findOneAndUpdate({ownerId:ownerID}, req.body.restaurants, function (err,data)
        {
          if (err)
          {
              res.json('nope');
          }
          else
          {
              res.json('yep');
              console.log(data)
          }
        })
    }

    if(req.body.type == "menu")
    {
        restModel.findOneAndUpdate({"ownerId":ownerID,"menu":{"$elemMatch": {_id:req.body.restaurants._id} }}, {"$set":{"menu.$.item_name":req.body.restaurants.item_name,"menu.$.description":req.body.restaurants.description,"menu.$.category_name":req.body.restaurants.category_name,"menu.$.item_price":req.body.restaurants.item_price,"menu.$.image_url":req.body.restaurants.image_url}}, function (err,data)
        {
          if (err)
          {
              res.json('something wrong');
          }
          else
          {
              console.log(data)
              res.status(200).json({"messege":"success"});
             
          }
        })
    }
    
    if(req.body.type == "categories")
    {
        restModel.findOneAndUpdate({ownerId:ownerID}, {category:req.body.restaurants}, function (err,data)
        {
          if (err)
          {
              res.json('nope');
          }
          else
          {
              res.json('yep');
              console.log(data)
          }
        })
    }
    
    if(req.body.type == "newMenu")
    {
        restModel.findOneAndUpdate({"ownerId":ownerID},{$push:{"menu":req.body.restaurants}}, function (err,data)
        {
          if (err)
          {
              res.json('nope');
          }
          else
          {
              res.status(200).json(data);
              console.log(data)
          }
        })
    }

    if(req.body.type == "additional")
    {
        
        restModel.findOneAndUpdate(
            {
         'ownerId': ownerID,
         'menu': {
             "$elemMatch": {
                 "_id": req.body.menuId
             }
         }
     },
     {
         "menu.$.additions":req.body.restaurants}
     ).then((data)=>{
        console.log(data)
        res.status(200).json("success")
    }).catch((err)=>{
        console.log(err)
    })

   
}
if(req.body.type == "date")
{
    
    restModel.findOneAndUpdate({ownerId:ownerID}, {calender:[{
        day:"Monday",
        start_time:"",
        end_time:""
    },
    {
      day:"Tuesday",
      start_time:"",
      end_time:""
    },
    {
      day:"Wenasday",
      start_time:"",
      end_time:""
    },
    {
      day:"Thursday",
      start_time:"",
      end_time:""
    },
    {
      day:"Friday",
      start_time:"",
      end_time:""
    },
    {
      day:"Saturday",
      start_time:"",
      end_time:""
    },
    {
      day:"Sunday",
      start_time:"",
      end_time:""
    }]}, function (err,data)
    {
      if (err)
      {
          res.json('nope');
      }
      else
      {
          res.json('yep');
          console.log(data,"llllllllllllllllllll")
      }
    })
}
}   
module.exports.addAdditionalItem = async( req, res) =>{
    console.log("hii")
    console.log(req.admin._id)
    console.log(req.body)
    var ownerID
    if(req.body.ownerId)
    {
        ownerID= req.body.ownerId
    }
    else
    {
        ownerID= req.admin._id
    }
    restModel.findOneAndUpdate(
        {
     'ownerId': ownerID,
     'menu': {
         "$elemMatch": {
             "_id": req.body.menuId
         }
     }
 },
 {
     "$push":{"menu.$.additions":req.body.restaurants}
 }

 ).then((data)=>{
      console.log(data)
      res.status(200).json("success")
  }).catch((err)=>{
      console.log(err)
  })

}

module.exports.addAdditionalItemDelete = async( req, res) =>{
    console.log("hii")
    console.log(req.admin._id)
    console.log(req.body)
    var ownerID
    if(req.body.ownerId)
    {
        ownerID= req.body.ownerId
    }
    else
    {
        ownerID= req.admin._id
    }
    restModel.findOneAndUpdate({ ownerId: ownerID,menu:{_id: req.body.menuId,additions:{_id:req.body.restaurants._id} } },{"$pull":{"menu.additions.$._id":req.body.restaurants._id}}

 ).then((data)=>{
      console.log(data)
      res.status(200).json("success")
  }).catch((err)=>{
      console.log(err)
  })
// restModel.findOneAndUpdate({"menu.additions._id":req.body.restaurants._id },{$pull:{"menu.additions.$._id":req.body.restaurants._id}}).then((res)=>console.log(res))

}
module.exports.restaurentOrder = async(req, res) =>{
    console.log(req.body)
    let orders = restModel.find({ownerId:req.admin._id}).then((data)=>{
        console.log(data[0]);
        orderModel.find({rest_id:data[0]._id}).then((orderData)=>{
            console.log(orderData)
            res.status(200).json({orders:orderData,rest_img:data[0].image_url})
        }).catch((err)=>console.log(err))
    }).catch(err=>console.log(err));
}

module.exports.userInfo = (req, res) =>{
    console.log(req.body)
    // UserModel.find({_id:req.body._id}).then((data)=>{res.status(200).json({data})}).catch((err)=>console.log(err))
    var categoriesArray = []
       console.log(req.body)
   UserModel.find({_id:req.body._id}).then((user)=>{
       console.log(user)
        if(user)
        {
            
               
                 let details = req.body.details
                 
             details.map((category,index)=>
                 {
                    console.log(category._id);
             
                 restModel.find(
                        { ownerId: req.admin._id}
                    ).then((restaurantData)=>{
                        // console.log(restaurantData[0].menu)
                      let finalCategories =  restaurantData[0].menu.filter((categoryList)=>{
                        
                            return categoryList._id == category.item_id
                        })
                    //    let finalAdditions = finalCategories.additions.map()
                    console.log(finalCategories)
                    categoriesArray.push(finalCategories[0])
                    if(index == details.length-1)
                    {
                        console.log("hii",categoriesArray)
                        res.status(200).json({data:user,category:categoriesArray})
                    }
                    })
                    console.log(categoriesArray)
                 })
                 console.log(categoriesArray,"jiiiiiiiiiiiiiiiiiiiiii")
                
                
            }
           


            
        })}
      
   


module.exports.getRestaurants = async (req, res) => {
    // const restList = await restModel.find({
    //     is_verified: true
    // });
    // console.log(restList)
    // return res.status(200).json({
    //     status: "success",
    //     count: restList.length,
    //     data: restList
    // })
    try{
   const restData = await restModel.find({})
   return res.status(200).json({
        status: "success",
        count: restData.length,
        data: restData
    })
    }
    catch(err){
        console.log(err)
    }
}

module.exports.deleteRestaurants = async (req, res) =>{
    console.log(req.body,"hiii")
    const deleteUser = restModel.deleteMany({
        _id:  req.body

        }).then((data)=>{
            res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
        })
  
}

module.exports.placeOrder = async (req, res) => {
    console.log(req.body)
    let date = new Date()
    let orderId=`order${date.getMonth()+1}m${date.getDate()}da${date.getHours()}h${date.getFullYear()}fy${date.getMinutes()}`
    let orderData = {
        _id:orderId,
        user_id:req.body.user_id,
        rest_id:req.body.rest_id,
        order_type:req.body.order_type,
        details:req.body.details,
        order_amount: req.body.order_amount
        
    }
    console.log(orderId)
    console.log(orderData)
    // req.body.id = req.user._id;
    const theOrder = await orderModel.create(orderData);
    return res.status(200).json({
        msg: "done"
    });
}
module.exports.deleteMyOrders = async (req, res) =>
{
    console.log(req.body)
    const deleteUser = orderModel.deleteMany({
        _id: {
            $in: req.body
          }
        },
        function(err, result) {
          if (err) {
            res.send(err);
          } else {
            res.status(200).send("user deleted");
          }
        
    })
}
module.exports.getMyOrders = async (req, res) => {
    console.log(req.user)
    var myorders = await orderModel.find({
        user_id: req.user._id
    }).populate('rest_id', ['image_url', 'name', 'menu','id']);

    var myneworders = [];


    myorders.forEach(order => {
        var neworder = {};
        neworder.ordered_items = [];
        neworder.rest_name = order.rest_id.name;
        neworder.rest_image_url = order.rest_id.image_url;
        neworder.amount = order.order_amount;
	neworder.restId = order.rest_id.id;
        neworder.address = order.address;
        neworder.pick_up_time = order.pick_up_time;
        neworder.user_id = order.user_id;
        neworder.order_status = order.order_status;
        neworder.is_complete = order.is_complete;
        neworder.order_type = order.order_type;
        neworder.transaction_id = order.transaction_id;
        neworder.createdAt = order.createdAt;
        neworder.updatedAt = order.updatedAt;

        //console.log(order.rest_id.menu)
        order.details.forEach(item => {
            neworder.rest_name = order.rest_id.name;
            order.rest_id.menu.forEach(jinnus => {
                if (item.item_id == jinnus._id) {
                    console.log(jinnus)
                    neworder.price += jinnus.item_price
                    const thedoc = {};
                    thedoc.item = jinnus;
                    thedoc.quantity = item.quantity
                    thedoc.additions = item.additions;
                    // item.additions.forEach(addition => {
                    //     jinnus.additions.forEach(jinadd => {
                    //         if (addition.addition_id == jinadd._id) {
                    //             var anotherdoc = {};
                    //             anotherdoc.addition_name = jinadd.addition_name
                    //             anotherdoc.selected = [];
                    //             addition.selected.forEach(selection => {
                    //                 jinadd.addition_data.forEach(jimu => {
                    //                     if (selection._id == jimu._id) {
                    //                         anotherdoc.selected.push(jimu)
                    //                     }
                    //                 })
                    //             })
                    //             thedoc.additions.push(anotherdoc);
                    //         }
                    //     })
                    // })
                    neworder.ordered_items.push(thedoc);

                }
            });
        });
        console.log(neworder)
        myneworders.push(neworder)
    });



    return res.status(200).json({
        msg: "success",
        count: myneworders.length,
        data: myneworders
    });

}

module.exports.newRecurringOrder = async (req, res) => {
    req.body.user_id = req.user._id;
    console.log(req.body)
    const theOrder = await recurModel.create(req.body);
    return res.status(200).json({
        status: "SUCCESS",
        msg: "Recurring order created successfully"
    });
}

module.exports.getRestRecurringOrderForTheDay = async (req, res) => {
    console.log(req.body)
    var d = new Date();
    //console.log(d.getDay());
    let day = d.getDay();
    let dd = d.getDate();
    let mon = d.getMonth() + 1;
    let year = d.getFullYear();
    let date = dd.toString() + "/" + mon.toString() + "/" + year.toString();
    console.log(day)
    const theOrders = await recurModel.find({
        rest_id: req.user.rest_id,
        "frequency.day": day,
        status: "active",
        "last_order_date": {
            $ne: date
        }

    }).populate('user_id');
    return res.status(200).json({
        status: "SUCCESS",
        data: theOrders
    })
}

module.exports.setAddress = async (req, res) => {
    var theuser = await UserModel.findOne({
        _id: req.user._id
    });
    theuser.addresses.push(req.body);

    await theuser.save();

    return res.status(200).json({
        status: "SUCCESS",
        msg: "New address added successfully"
    });
}

module.exports.editAddress = async (req, res) => {
    var theuser = await UserModel.findOne({
        _id: req.user._id
    });

    for (let i = 0; i < theuser.addresses.length; i++) {
        if (req.body._id == theuser.addresses[i]._id) {
            theuser.addresses[i].name = req.body.name;
            theuser.addresses[i].address = req.body.address;
            break;
        }
    }
    await theuser.save();

    return res.status(200).json({
        status: "SUCCESS",
        msg: "Address edited successfully"
    });
}

module.exports.deleteAddress = async (req, res) => {
    var theuser = await UserModel.findOne({
        _id: req.user._id
    });
    var newaddresses = [];
    for (let i = 0; i < theuser.addresses.length; i++) {

        if (req.body._id != theuser.addresses[i]._id) {
            newaddresses.push(theuser.addresses[i])
        }
    }

    theuser.addresses = newaddresses;
    await theuser.save();

    return res.status(200).json({
        status: "SUCCESS",
        msg: "Address deleted successfully"
    });
}

module.exports.addRecipe = async (req, res) => {
    req.body.user_id = req.user._id;

    const added = await recipeModel.create(req.body);

    return res.status(200).json({
        status: "SUCCESS",
        msg: "Recipe added successfully"
    });

}

module.exports.getMyRecipes = async (req, res) => {
    console.log(req.user,"hiii")
    const myorders = await recipeModel.find({
        // rest_id: req.body.rest_id,
        user_id: req.user._id
    }).populate('rest_id', ['image_url', 'name', 'menu']);
    
    var myneworders = [];

     console.log(myorders,"order")
    myorders.forEach(order => {
        var neworder = {};
        neworder._id = order._id
        neworder.ordered_items = [];
        neworder.rest_name = order.rest_id.name;
        neworder.rest_id = order.rest_id._id;
        neworder.rest_image_url = order.rest_id.image_url;
        neworder.amount = order.order_amount;
        neworder.address = order.address;
        neworder.pick_up_time = order.pick_up_time;
        neworder.user_id = order.user_id;
        neworder.order_status = order.order_status;
        neworder.is_complete = order.is_complete;
        neworder.order_type = order.order_type;
        neworder.transaction_id = order.transaction_id;

        //console.log(order.rest_id.menu)
        order.details.forEach(item => {
            neworder.rest_name = order.rest_id.name;
            order.rest_id.menu.forEach(jinnus => {
                if (item.item_id == jinnus._id) {
                    console.log(jinnus)
                    neworder.price += jinnus.item_price
                    const thedoc = {};
                    thedoc.item = jinnus;
                    thedoc.quantity = item.quantity
                    thedoc.additions = item.additions;
                    // item.additions.forEach(addition => {
                    //     jinnus.additions.forEach(jinadd => {
                    //         if (addition.addition_id == jinadd._id) {
                    //             var anotherdoc = {};
                    //             anotherdoc.addition_name = jinadd.addition_name
                    //             anotherdoc.selected = [];
                    //             addition.selected.forEach(selection => {
                    //                 jinadd.addition_data.forEach(jimu => {
                    //                     if (selection._id == jimu._id) {
                    //                         anotherdoc.selected.push(jimu)
                    //                     }
                    //                 })
                    //             })
                    //             thedoc.additions.push(anotherdoc);
                    //         }
                    //     })
                    // })
                    neworder.ordered_items.push(thedoc);

                }
            });
        });
        myneworders.push(neworder)
    });
    console.log(myneworders,"muOrders")
    return res.status(200).json({
        status: "SUCCESS",
        data: myneworders
    });
}

module.exports.getAllMyRecipes = async (req, res) => {
    const recList = await recipeModel.find({
        user_id: req.user._id
    }).populate('rest_id', ['image_url', 'name', 'menu']);

    console.log(req.user._id);
    var myneworders = recList;


    myneworders.forEach(order => {
        var neworder = {};
        neworder.ordered_items = [];
        neworder.rest_name = order.rest_id.name;
        neworder.rest_image_url = order.rest_id.image_url;
        neworder.amount = order.order_amount;
        neworder.address = order.address;
        neworder.pick_up_time = order.pick_up_time;
        neworder.user_id = order.user_id;
        neworder.order_status = order.order_status;
        neworder.is_complete = order.is_complete;
        neworder.order_type = order.order_type;
        neworder.transaction_id = order.transaction_id;

        //console.log(order.rest_id.menu)
        order.details.forEach(item => {
            neworder.rest_name = order.rest_id.name;
            order.rest_id.menu.forEach(jinnus => {
                if (item.item_id == jinnus._id) {
                    console.log(jinnus)
                    neworder.price += jinnus.item_price
                    const thedoc = {};
                    thedoc.item = jinnus;
                    thedoc.quantity = item.quantity
                    thedoc.additions = item.additions;
                    // item.additions.forEach(addition => {
                    //     jinnus.additions.forEach(jinadd => {
                    //         if (addition.addition_id == jinadd._id) {
                    //             var anotherdoc = {};
                    //             anotherdoc.addition_name = jinadd.addition_name
                    //             anotherdoc.selected = [];
                    //             addition.selected.forEach(selection => {
                    //                 jinadd.addition_data.forEach(jimu => {
                    //                     if (selection._id == jimu._id) {
                    //                         anotherdoc.selected.push(jimu)
                    //                     }
                    //                 })
                    //             })
                    //             thedoc.additions.push(anotherdoc);
                    //         }
                    //     })
                    // })
                    neworder.ordered_items.push(thedoc);

                }
            });
        });
        myneworders.push(neworder)
    });


    return res.status(200).json({
        status: "SUCCESS",
        data: myneworders
    });
}

module.exports.deleteRecipe = async (req, res) => {
    console.log(req.body)
    const added = await recipeModel.deleteOne({
        _id: req.body.recipe_id
    });

    return res.status(200).json({
        status: "SUCCESS",
        msg: "Recipe deleted successfully"
    });
}

module.exports.acceptRecurringOrder = async (req, res) => {
    var order = {};
    const recur_id = req.body.recur_id;
    var therecurorder = await recurModel.findOne({
        _id: recur_id
    });
    order.details = therecurorder.order_details;
    order.rest_id = therecurorder.rest_id;
    order.address = therecurorder.address;
    order.order_type = therecurorder.type;
    order.user_id = therecurorder.user_id;
    order.recurring = {};
    order.recurring.recurring_id = therecurorder._id;


    const d = new Date();
    //console.log(d.getDay());
    let day = d.getDay();
    let dd = d.getDate();
    let mon = d.getMonth() + 1;
    let year = d.getFullYear();
    let date = dd.toString() + "/" + mon.toString() + "/" + year.toString();

    therecurorder.last_order_date = date;
    await therecurorder.save();

    const newOrder = await orderModel.create(order);

    return res.status(200).json({
        status: "SUCCESS",
        msg: "Order created successfully"
    });

}

module.exports.getUserRecurringOrders = async (req, res) => {
    console.log(req.user._id,"hiiii")
    const allRecur = await recurModel.find({
        user_id: req.user._id
    });
    console.log(allRecur,"kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
    var myneworders = [];
    

    allRecur.forEach(async(order) => {
        var rest_id = await restModel({
            _id : order.rest_id
        })
        console.log(rest_id)
        var neworder = {};
        neworder.ordered_items = [];
        neworder.rest_name = rest_id.name;
        neworder.rest_image_url = rest_id.image_url;
        neworder.amount = order.order_amount;
        neworder.address = order.address;
        neworder.pick_up_time = order.pick_up_time;
        neworder.user_id = order.user_id;
        neworder.order_status = order.status;
        neworder.is_complete = order.is_complete;
        neworder.order_type = order.order_type;
        neworder.transaction_id = order.transaction_id;

        //console.log(order.rest_id.menu)
        order.order_details.forEach(item => {
            console.log(item)
            neworder.rest_name = rest_id.name;
            rest_id.menu.forEach(jinnus => {
                if (item.item_id == jinnus._id) {
                    console.log(jinnus)
                    neworder.price += jinnus.item_price
                    const thedoc = {};
                    thedoc.item = jinnus;
                    thedoc.quantity = item.quantity
                    thedoc.additions = item.additions;
                    neworder.ordered_items.push(thedoc);

                }
            });
        });
        console.log(neworder)
        myneworders.push(neworder)
    });

    return res.status(200).json({
        status: "SUCCESS",
        data: allRecur,
        populated_data: myneworders
    });
}

module.exports.updateRecurOrder = async (req, res) => {
    const theOrder = await recurModel.updateOne({
        _id: req.body.order_id
    }, req.body);

    return res.status(200).json({
        status: "SUCCESS",
        msg: "Order updated successfully"
    });


}


// module.exports.getAllOrderss = async (req, res) => {
     
//     const myorder = await recipeModel.find({});
     
//     const userMap = {};
//     myorder.forEach((user) => {
//         userMap[user._id] = user;
//     });
//     return res.status(200).json({
//         status: "SUCCESS",
//         data: userMap
//     });
// }
//Api For Admin

//Fetch All Orders
module.exports.getAllOrderss = async (req, res) => {
    const orders = await orderModel.find({});
    console.log(orders)
    res.status(200).json({
        status: "SUCCESS",
        orders,
    });
  };


  //Fetch All Orders
module.exports.getAllUserss = async (req, res) => {
    try { 
        const users = await UserModel.find({});
        console.log(users)
        res.status(200).json({
            status: "SUCCESS",
            users,
        });
    }
    catch (err) {
        next(err);
      }
  };
//Admin Sign In
  module.exports.adminSignIn = async (req, res ,next) => {
      console.log(req.body)
      console.log(req.body.password )
    const { email, password } = req.body;
    // if (!email || !password) {
    //   return next(new ErrorResponse("Please provide an email and password", 400));
    // }
    try {
        // const admin = await AdminModel.findOne({ "email" : req.body.email });
        const admin = await AdminModel.findOne({ $or: [ { email: req.body.email   }, { restaurantId : req.body.email } ] });
        console.log(admin)
         
        if(admin.password == req.body.password){
            sendToken(admin, 200, res);
             
        }
        else{
            return next(new ErrorResponse("Invalid credentials", 401));
        }
        
      } catch (err) {
        next(err);
      }
  };


  //SubAdmin Sign up
  module.exports.subAdminSignup = async (req, res ,next) => {
    console.log(req.body)
    console.log(req.body.password )
  const { email, password ,role , restaurantId} = req.body;
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }
  try {
      const admin = await AdminModel.findOne({ "email" : req.body.email });
       
      console.log(admin)
      if (admin) {
        return res.status(409).json({ sucess: false, error: "user already exist" })
      }
      const user = await AdminModel.create({
        email,
        password,
        role,
        restaurantId
      });
      res.status(200).json("success")
    //   sendToken(user, 200, res);
      
    } catch (err) {
      next(err);
    }
};

module.exports.getSubadmins = async (req, res) => {
    try { 
        const subadmins = await AdminModel.find({role : "subadmin"});
        console.log(subadmins)
        res.status(200).json({
            status: "SUCCESS",
            subadmins,
        });
    }
    catch (err) {
        next(err);
      }
  };

  //get admin collection data
exports.getadminsData = async (req, res, next) => {
    try {
        const { _id, email, password, role} = req.admins;
        res.status(200).json({  _id, email, password, role });
    } catch (err) {
        next(err);
    }
};
  module.exports.getRestaurantIds = async (req, res) => {
    try { 
        const restaurantId = await AdminModel.find({role : "restaurant"});
        console.log(restaurantId)
        res.status(200).json({
            status: "SUCCESS",
            restaurantId,
        });
    }
    catch (err) {
        next(err);
      }
  };
module.exports.addRestaurant = async (req, res ,next) => {
    console.log(req.body)
    console.log(req.body.ownerId )
  const { name ,address ,description,latitude ,longitude ,rating , category,number_of_ratings,profile_percentage,experience  , about , phone_number ,field_changed ,available_modes, is_verified , calender ,certifications ,ownerId} = req.body;
  
  try {
      const admin = await restModel.findOne({ "name" : req.body.name });
       
      console.log(admin)
      if (admin) {
        return res.status(409).json({ sucess: false, error: "restaurant already exist" })
      }
      const user = await restModel.create({
        name ,address ,description,latitude ,longitude ,rating , category,number_of_ratings,profile_percentage,experience  ,about ,phone_number , field_changed , available_modes,is_verified ,calender,certifications,ownerId
      });
  
    //   sendToken(user, 200, res);
      
    } catch (err) {
      next(err);
    }
};


module.exports.addItem = async (req, res ,next) => {
    console.log(req.body)
    // console.log(req.body.restId  )
  const { menu } = req.body;
  
  try {
    
    //   const admin = await restModel.findOne({ "ownerId" : req.body.restId });
       
    //   console.log(admin)
    //   if (admin) {
    //     admin.updateOne({ $push: { menu: req.body.menu } });
    //   }
    const admin =  await restModel.updateOne( { "ownerId" : req.body.restId }  ,{ $set:  { menu: req.body.AllItem } }); 
    console.log(admin)
      sendToken(user, 200, res);
      
    } catch (err) {
      next(err);
    }
};

module.exports.updatePassword = async (req, res ,next) => {
    console.log(req.body.password)
    // console.log(req.body.restId  )
  const { password } = req.body;
  
  try {
    
     
    const admin =  await AdminModel.updateOne( { "_id" : req.body.restId }  ,{ $set:  { password: req.body.password } }); 
    console.log(admin)
    //   sendToken(user, 200, res);
      
    } catch (err) {
      next(err);
    }
};
  const sendToken = async (admin, statusCode, res) => {
    const token = await admin.getSignedJwtToken();
    console.log(admin)
    res.status(statusCode).json({ sucess: true, token , admin});
  };