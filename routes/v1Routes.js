const express = require('express');
const router = express.Router();

// Import controllers
// const userController = require("../controllers/v1/userController");
const visitorController = require("../controllers/v1/visitorController");
const companyController = require("../controllers/v1/companyController");
const countryController = require("../controllers/v1/countryController");
const visitPurposeController = require("../controllers/v1/visitPurposeController");

// Use user register
// router.route('/user/register').post(userController.register);
// router.route('/user/login').post(userController.login);
// router.route('/user/me').post(userController.getMe);
// router.route('/user/list').get(userController.list);

// // Use visitor routes
router.route('/visitor/register').post(visitorController.register);
router.route('/visitor/list').get(visitorController.list);

// // Use company routes
router.route('/company/register').post(companyController.register);
router.route('/company/list').get(companyController.list);
router.route('/company/:id').get(companyController.show)
router.route('/company/:id').put(companyController.update)

// // Use country routes
router.route('/country/list').get(countryController.list);
router.route('/country/flag').get(countryController.flag);
router.route('/country/code').get(countryController.code);

// Use purpose of the visit
router.route('/visitPurpose/')
    .post(visitPurposeController.addVisitPurpose)
    .get(visitPurposeController.listVisitPurpose)
    .put(visitPurposeController.updateVisitPurpose)
    .delete(visitPurposeController.deleteVisitPurpose);

module.exports = router;