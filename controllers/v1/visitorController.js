const express = require('express');
const Visitor = require('../../models/Visitor');
// const VisitPurpose = require('../../models/VisitPurpose');

const register = async (req, res) => {

    try {
        const { firstName, lastName, phone, email, idType, idNumber, visitPurpose } = req.body;

        const newVisitor = new Visitor({
            firstName, lastName, phone, email, idType, idNumber, visitPurpose
        });

        const savedVisitor = await newVisitor.save();

        const visitPurposeId = savedVisitor.visitPurpose; 
        const visitPurposeData = await VisitPurpose.findById(savedVisitor.visitPurpose);

        const visitorData = {
            id: savedVisitor.id,
            fullName: savedVisitor.fullName,
            phone: savedVisitor.phone,
            email: savedVisitor.email,
            visitPurpose: visitPurposeData.name,
            checkIn: savedVisitor.checkInDateTime,
            checkOut: savedVisitor.checkOutDateTime
        };

        const responseCode = 201;
        const responseDate = {
            "success": true,
            "code": responseCode,
            "message": "Register Successfully!",
            "data": visitorData
        };
        res.status(responseCode).json(responseDate);
    } catch (error) {
        console.error(error);
        
        if (error.name === 'ValidationError') {
            const formattedErrors = Object.keys(error.errors).map(key => ({
                path: error.errors[key].path,
                message: error.errors[key].message
            }));

            const responseCode = 400;
            const responseDate = {
                "success": false,
                "code": responseCode,
                "message": "Error Occured!",
                "errors": formattedErrors
            }
            res.status(responseCode).json(responseDate);
        } else {
            const responseCode = 500;
            const responseDate = {
                "success": false,
                "code": responseCode,
                "message": "Error Occured!",
                "errors": { "Error": "Server error" }
            }
            res.status(responseCode).json(responseDate);
        }
    }
}

const list = async (req, res) => {

    try {

        const visitors = await Visitor
            .find({ checkIn: { '$eq': new Date() } }).populate('visitPurpose', 'name', 'VisitPurpose')
            // .select('id, firstName lastName phone email checkIn checkOut visitPurpose')
            .sort({ checkIn: 'asc' });

        const visitorData = visitors.map(visitor => {
            return {
                id: visitor.id,
                fullName: visitor.fullName,
                phone: visitor.phone,
                email: visitor.email,
                visitPurpose: visitor.visitPurpose.name,
                checkIn: visitor.checkInDateTime,
                checkOut: visitor.checkOutDateTime
            };
        });

        const responseCode = 200
        const responseDate = {
            "success": true,
            "code": responseCode,
            "message": "",
            "data": visitorData
        }
        res.status(responseCode).json(responseDate)
    } catch (error) {
        console.error(error);

        if (error.name === 'ValidationError') {
            const formattedErrors = Object.keys(error.errors).map(key => ({
                path: error.errors[key].path,
                message: error.errors[key].message
            }));

            const responseCode = 400;
            const responseDate = {
                "success": false,
                "code": responseCode,
                "message": "Error Occured!",
                "errors": formattedErrors
            }
            res.status(responseCode).json(responseDate);
        } else {
            const responseCode = 500;
            const responseDate = {
                "success": false,
                "code": responseCode,
                "message": "Error Occured!",
                "errors": { "Error": "Server error" }
            }
            res.status(responseCode).json(responseDate);
        }
    }
}

module.exports = { register, list }