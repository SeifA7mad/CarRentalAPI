const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

//POST SIGNUP
exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (!`${email}`.includes('@')) {
    const error = new Error('Please enter a valid email.');
    error.statusCode = 422;
    throw error;
  }
  if (`${password}`.length < 4) {
    const error = new Error(
      'Please enter a valid password must contain atleast 4 letters.'
    );
    error.statusCode = 422;
    throw error;
  }

  if (password.toString() !== confirmPassword.toString()) {
    const error = new Error('Passwords doesnot match');
    error.statusCode = 422;
    throw error;
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        const error = new Error('E-Mail address already exists!');
        error.statusCode = 422;
        throw error;
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            reservations: { orders: [], ongoingReturnDate: '' },
          });
          return user.save();
        })
        .then((result) => {
          return res.status(200).json({ message: 'Account Created!' });
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//POST LOGIN
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isPasswordCorrect) => {
      if (!isPasswordCorrect) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        process.env.ENCRYPT_SECRET,
        { expiresIn: '1h' }
      );
      console.log({ token: token, userId: loadedUser._id.toString() });
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//GET ACCOUNT
exports.getAccount = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      return res.status(200).json({ name: user.name, email: user.email });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postEditPassword = (req, res, next) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  let loadedUser;

  User.findById(req.userId)
    .then((user) => {
      loadedUser = user;
      return bcrypt.compare(oldPassword, user.password);
    })
    .then((isPasswordCorrect) => {
      if (!isPasswordCorrect) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      if (`${newPassword}`.length < 4) {
        const error = new Error(
          'Please enter a valid password must contain atleast 4 letters.'
        );
        error.statusCode = 422;
        throw error;
      }
      return bcrypt
        .hash(newPassword, 12)
        .then((newHashedPassword) => {
          loadedUser.password = newHashedPassword;
          return loadedUser.save();
        })
        .then((result) => {
          return res.status(200).json({ message: 'Account Updated!' });
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
