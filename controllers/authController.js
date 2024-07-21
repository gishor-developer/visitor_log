const express = require('express');
const createError = require('http-errors');
const Joi = require('joi');
const Auth = require('../models/Auth');
const { registerSchema, tokenSchema } = require('../validations/authSchema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwtHelpers')

const register = async (req, res, next) => {
    const userData = req.body;

    try {
        // Validate user data against the Joi schema
        const { error, value } = registerSchema.validate(userData);

        if (error) {
            const formattedErrors = Object.keys(error.details).map(key => ({
                // path: error.details[key].path,
                message: error.details[key].message
            }));
            next(createError.BadRequest(formattedErrors[0].message));
        }

        const doesExist = await Auth.findOne({ username: value.username })
        if (doesExist)
            next(createError.Conflict(`${value.username} is already been registered`));

        // Create a new user instance based on validated data
        const newAuth = new Auth(value);

        // Save the user to the database using Mongoose
        const savedUser = await newAuth.save();

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

const access_token = async (req, res, next) => {

    try {
        const tokenData = req.body;

        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization'];

        const { error, value } = tokenSchema.validate(tokenData);

        if (error) {
            next(createError.BadRequest('Invalid Request'));
        }

        if (value.grant_type == 'client_credentials') {
            const basicToken = authHeader.split(' ')
            const token = basicToken[1];

            // Convert the base64 string to a Buffer
            const binaryData = Buffer.from(token, 'base64');
            const basicAuth = binaryData.toString('utf8');
            const credentials = basicAuth.split(':');

            const username = credentials[0];
            const password = credentials[1];

            const auth = await Auth.findOne({ username: username });

            const authId = auth.id;

            if (!auth)
                next(createError.NotFound('User not registered'));

            const isMatch = await auth.isValidPassword(password);
            if (!isMatch)
                next(createError.Unauthorized('Invalid Username/Password'));

            const accessToken = await signAccessToken(authId);
            const refreshToken = await signRefreshToken(authId);

            res.status(200).send({ accessToken, refreshToken });
        } else {

            next(createError.BadRequest('Invalid Request!'));
        }


    } catch (error) {
        console.log(error);
        if (error.isJoi === true)
            return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
}

const refresh_token = async (req, res, next) => {

    try {
        const tokenData = req.body;

        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization'];

        const { error, value } = tokenSchema.validate(tokenData);

        if (error) {
            next(createError.BadRequest('Invalid Request!'));
        }

        if (value.grant_type == 'refresh_token') {

            const basicToken = authHeader.split(' ')
            const token = basicToken[1];

            if (!token) throw createError.BadRequest()
            const authId = await verifyRefreshToken(token)

            const accessToken = await signAccessToken(authId);
            const refreshToken = await signRefreshToken(authId);

            res.status(200).send({ accessToken, refreshToken });
        }
        else {
            next(createError.BadRequest('Invalid Request!'));
        }

    } catch (error) {
        console.log(error);
        if (error.isJoi === true)
            return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
}

module.exports = { register, access_token, refresh_token }