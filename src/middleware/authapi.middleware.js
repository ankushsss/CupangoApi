const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../newmodel/user.model");
const Expert = require("../newmodel/expert.model");
const Admin = require("../newmodel/admin.model");
module.exports.isUserAuth = (req, res, next) => {
    console.log(req.user)
    const authHeader = req.headers.authorization;
    const bearer = 'Bearer ';
    
    if (!authHeader || !authHeader.startsWith(bearer)) {
        res.status(401).json({
            message: 'Access denied. No credentials sent!'
        });
        return;
    }
    const token = authHeader.replace(bearer, '');
    jwt.verify(
        token,
        process.env.SECRET_JWT,
        async function (err, decoded) {
            if (err || !decoded) {
                res.json({
                    message: "Error",
                    Detail: "Malformed JWT"
                });
                return;
            }
            const data = decoded;
            const user = await User.findOne({
                _id: data._id
            }, {});

            req.user = user;

            if (user.role == "user" || user.role == "admin" || user.role == "expert") {
                next();
            } else {
                res.send("Wrong");
                //return res.redirect("/login");
            }

        }
    );

};

module.exports.isOwnerAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearer = 'Bearer ';
    console.log(req.body)
    if (!authHeader || !authHeader.startsWith(bearer)) {
        res.status(401).json({
            message: 'Access denied. No credentials sent!'
        });
        return;
    }
    const token = authHeader.replace(bearer, '');
    jwt.verify(
        token,
        process.env.SECRET_JWT,
        async function (err, decoded) {
            if (err || !decoded) {
                res.json({
                    message: "Error",
                    Detail: "Malformed JWT"
                });
                return;
            }
            const data = decoded;
            const user = await User.findOne({
                _id: data._id
            }, {});

            req.user = user;

            if (user.role == "rest_owner") {
                next();
            } else {
                res.send("Wrong");
                //return res.redirect("/login");
            }
        }
    );
};

module.exports.isExpert = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearer = 'Bearer ';

    if (!authHeader || !authHeader.startsWith(bearer)) {
        res.status(401).json({
            message: 'Access denied. No credentials sent!'
        });
        return;
    }
    const token = authHeader.replace(bearer, '');
    jwt.verify(
        token,
        process.env.SECRET_JWT,
        async function (err, decoded) {
            if (err || !decoded) {
                res.json({
                    message: "Error",
                    Detail: "Malformed JWT"
                });
                return;
            }
            const data = decoded;
            var user = await Expert.findOne({
                _id: data._id
            }, {});
            user.role = "expert";
            req.user = user;
            if (user.role == "expert") {
                next();
            } else {
                return res.status(401).json({
                    message: "Unathorized - Role incorrect"
                });
            }
        }
    );
};



//checking for admin
module.exports.isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearer = 'Bearer ';
    console.log(authHeader)
    if (!authHeader || !authHeader.startsWith(bearer)) {
        res.status(401).json({
            message: 'Access denied. No credentials sent!'
        });
        return;
    }
    const token = authHeader.replace(bearer, '');
    jwt.verify(
        token,
        process.env.SECRET_JWT,
        async function (err, decoded) {
            if (err || !decoded) {
                res.json({
                    message: "Error",
                    Detail: "Malformed JWT"
                });
                return;
            }
            const data = decoded;
            var admin = await Admin.findOne({
                _id: data.id
            }, {});
            admin.role = "admin";
            req.admin = admin;
            if (admin.role == "admin") {
                next();
            } else {
                return res.status(401).json({
                    message: "Unathorized - Role incorrect"
                });
            }
        }
    );
};
