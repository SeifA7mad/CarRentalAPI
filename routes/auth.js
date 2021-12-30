const router = require('express').Router();

const authController = require('../controllers/auth');

const isAuth = require('../middlewares/is-auth');

//post-signup ==> POST
router.post('/signup', authController.postSignup);

//post-login ==> POST
router.post('/login', authController.postLogin);

//get-account ==> GET
router.get('/get-account', isAuth.isAuthUser, authController.getAccount);

//post-editPassword ==> POST
router.post(
  '/edit-password',
  isAuth.isAuthUser,
  authController.postEditPassword
);

module.exports = router;
