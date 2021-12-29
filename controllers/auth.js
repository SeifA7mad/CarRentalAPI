const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (!`${email}`.includes('@')) {
    return res.send({
      err: 'Email invalid',
    });
  }
  if (`${password}`.length < 4) {
    return res.send({
      err: 'password must contains at least 4 letters',
    });
  }

  if (password.toString() !== confirmPassword.toString()) {
    return res.send({
      err: 'password does not match',
    });
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.send({
          err: 'email is already signed up',
        });
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            reservations: { orders: [] },
            ongoingReturnDate: '',
          });
          return user.save();
        })
        .then((result) => {
          return res.send({
            success: 'signed up successfully',
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
