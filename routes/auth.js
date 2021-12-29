const router = require('express').Router();

const authController = require('../controllers/auth');

//post-signup ==> POST
router.post('/signup', authController.postSignup);

module.exports = router;