const router = require('express').Router();

const authController = require('../controllers/auth');

//post-signup ==> POST
router.post('/signup', authController.postSignup);

//post-login ==> POST
router.post('/login', authController.postLogin);

module.exports = router;