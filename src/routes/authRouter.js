const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

//router.get('/profile', authController.getProfile);
router.post('/register', authController.register);
//router.post('/login', authController.logIn);
//router.post('/logout', authController.logOut);
//router.post('/refresh', authController.refresh)

module.exports = router;