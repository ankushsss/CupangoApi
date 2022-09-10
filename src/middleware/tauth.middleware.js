const HttpException = require('../utils/HttpException.utils');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const dataModel = require('../models/data.model');
const auth = (...roles) => {
    return async function (req, res, next) {
        try {
            
            let dataList = await dataModel.find();
             if (!dataList.length) {
            throw new HttpException(404, 'Users not found');
            }

    /*dataList = dataList.map(data => {
        const { password, ...userWithoutPassword } = data;
        return userWithoutPassword;
    });*/
    //return dataList;

    res.send(dataList);

        } catch (e) {
            e.status = 401;
            next(e);
        }
    }
}


module.exports = auth;
