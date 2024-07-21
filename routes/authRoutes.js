const express = require('express');
const router = express.Router();

// Import controllers
const authController = require("../controllers/authController");

// Auth Route
router.route('/register').post(authController.register);
router.route('/access_token').post(authController.access_token);
router.route('/refresh_token').post(authController.refresh_token);

module.exports = router;