const express = require('express');
const createError = require('http-errors');
const Joi = require('joi');
const User = require('../../models/User');
const { registerSchema, loginSchema } = require('../../validations/userSchema');
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require('../../helpers/jwtHelpers')

const register = async (req, res, next) => {
    const userData = req.body;

    try {
        // Validate user data against the Joi schema
        const { error, value } = registerSchema.validate(userData);

        if (error) {
            const formattedErrors = Object.keys(error.details).map(key => ({
                // path: err.errors[key].path,
                message: err.errors[key].message
            }));
            next(createError.BadRequest(error.details[0].message));
        }

        const doesExist = await User.findOne({ email: value.email })
        if (doesExist)
            next(createError.Conflict(`${value.email} is already been registered`));

        // Create a new user instance based on validated data
        const newUser = new User(value);

        // Save the user to the database using Mongoose
        const savedUser = await newUser.save();

        const savedData = {
            fullName: savedUser.name,
            email: savedUser.email
        };

        const accessToken = await signAccessToken(savedUser.id)
        // const refreshToken = await signRefreshToken(savedUser.id)

        const responseCode = 201;
        const responseData = {
            "success": true,
            "message": "Register Successfully!",
            "data": savedData,
            "accessToken": accessToken
            // "refreshToken": refreshToken
        };
        res.status(responseCode).json(responseData);
    } catch (err) {

        console.error(err);

        // Handle potential duplicate key error (MongoServerError E11000)
        if (err.name === 'MongoServerError' && err.code === 11000) {
            next(createError.BadRequest('Duplicate key error: Email already exists!'));
        }

        if (err.name === 'ValidationError') {
            const formattedErrors = Object.keys(err.errors).map(key => ({
                // path: err.errors[key].path,
                message: err.errors[key].message
            }));
            next(createError.BadRequest(formattedErrors[0].message));
        }

        // Handle other errors
        next(createError.InternalServerError('Internal Server Error'));
    }
}

const login = async (req, res, next) => {
    const loginData = req.body;

    try {
        // Validate user data against the Joi schema
        const { error, value } = loginSchema.validate(loginData);

        if (error) {
            const formattedErrors = Object.keys(error.details).map(key => ({
                // path: err.errors[key].path,
                message: err.errors[key].message
            }));
            next(createError.BadRequest('Invalid Username/Password'));
        }

        const user = await User.findOne({ email: value.email });

        if (!user)
            next(createError.NotFound('User not registered'))

        const isMatch = await user.isValidPassword(value.password)
        if (!isMatch)
            next(createError.Unauthorized('Invalid Username/Password'))

        const accessToken = await signAccessToken(user.id)
        const refreshToken = await signRefreshToken(user.id)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true)
            return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
}

// const list = async (req, res) => {

//     try {

//         const visitors = await Visitor
//             .find({ checkIn: { '$eq': new Date() } }).populate('visitPurpose', 'name', 'VisitPurpose')
//             // .select('id, firstName lastName phone email checkIn checkOut visitPurpose')
//             .sort({ checkIn: 'asc' });

//         const visitorData = visitors.map(visitor => {
//             return {
//                 id: visitor.id,
//                 fullName: visitor.fullName,
//                 phone: visitor.phone,
//                 email: visitor.email,
//                 visitPurpose: visitor.visitPurpose.name,
//                 checkIn: visitor.checkInDateTime,
//                 checkOut: visitor.checkOutDateTime
//             };
//         });

//         const responseCode = 200
//         const responseDate = {
//             "success": true,
//             "code": responseCode,
//             "message": "",
//             "data": visitorData
//         }
//         res.status(responseCode).json(responseDate)
//     } catch (error) {
//         console.error(error);

//         if (error.name === 'ValidationError') {
//             const formattedErrors = Object.keys(error.errors).map(key => ({
//                 path: error.errors[key].path,
//                 message: error.errors[key].message
//             }));

//             const responseCode = 400;
//             const responseDate = {
//                 "success": false,
//                 "code": responseCode,
//                 "message": "Error Occured!",
//                 "errors": formattedErrors
//             }
//             res.status(responseCode).json(responseDate);
//         } else {
//             const responseCode = 500;
//             const responseDate = {
//                 "success": false,
//                 "code": responseCode,
//                 "message": "Error Occured!",
//                 "errors": { "Error": "Server error" }
//             }
//             res.status(responseCode).json(responseDate);
//         }
//     }
// }

module.exports = { register, login }