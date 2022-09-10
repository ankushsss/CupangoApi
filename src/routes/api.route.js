const express = require("express");
const router = express.Router();
const api = require("../controllers/api.controller");
const img = require("../controllers/images.controller");
const auth = require("../middleware/authapi.middleware");



router.get("/v1/", auth.isUserAuth, api.checkapi);
router.post("/v1/otp", api.sendOTP);
router.post("/v1/otp/verify", api.verifyOTP);
router.post("/v1/user/edit", auth.isUserAuth, api.editUserProfile);
router.post("/v1/restaurant/", auth.isUserAuth, api.editRestaurant);

router.get("/v1/restaurant/", api.getRestaurants);
router.post("/v1/restaurant/delete", api.deleteRestaurants)



router.post("/v1/order/", api.placeOrder);
router.get("/v1/order/",auth.isUserAuth, api.getMyOrders);
router.post("/v1/order/delete", api.deleteMyOrders);
router.post("/v1/address/new", auth.isUserAuth, api.setAddress);
router.post("/v1/address/edit", auth.isUserAuth, api.editAddress);
router.post("/v1/address/delete", auth.isUserAuth, api.deleteAddress);
router.post("/v1/recipe/add", auth.isUserAuth, api.addRecipe);
router.post("/v1/recipe/delete", auth.isUserAuth, api.deleteRecipe)
router.get("/v1/recipe/", auth.isUserAuth, api.getMyRecipes);
router.get("/v1/recipe/all", auth.isUserAuth, api.getAllMyRecipes);
router.get('/v1/mine/', auth.isUserAuth, api.getMyProfile);



router.post("/v1/recurring/new", auth.isUserAuth, api.newRecurringOrder);
router.get("/v1/recurring/restuarant/", auth.isOwnerAuth, api.getRestRecurringOrderForTheDay);
router.post("/v1/recurring/accept", auth.isOwnerAuth, api.acceptRecurringOrder);
router.get("/v1/recurring/mine", auth.isUserAuth, api.getUserRecurringOrders);
router.post("/v1/recurring/edit", auth.isUserAuth, api.updateRecurOrder);
router.get("/v1/allorder", api.getAllOrderss); 
router.get("/v1/alluser",auth.isAdmin, api.getAllUserss); 
router.post("/v1/signin", api.adminSignIn);
router.post("/v1/signup", api.subAdminSignup);
router.get("/v1/getsubadmin", api.getSubadmins);
router.get("/v1/getrestaurantId", api.getRestaurantIds);
router.get("/v1/getadmins", api.getadminsData);
router.post("/v1/addrestaurant", api.addRestaurant);
router.post("/v1/additem", api.addItem);
router.post("/v1/updatepass", api.updatePassword);
router.post("/v1/singlerestaurant/", auth.isAdmin, api.getSingleRestaurant);
router.post("/v1/editsinglerestaurant/", auth.isAdmin, api.editSingleRestaurant);
router.post("/v1/menuItem/delete", auth.isAdmin, api.menuItemdelete)
router.post("/v1/addadditionalitem/", auth.isAdmin, api.addAdditionalItem)
router.post("/v1/additionalitem/delete", auth.isAdmin, api.addAdditionalItemDelete)
router.post("/v1/singleRestaurent/order", auth.isAdmin, api.restaurentOrder)
router.post("/v1/singleRestaurent/order/userinfo", auth.isAdmin, api.userInfo)
module.exports = router;