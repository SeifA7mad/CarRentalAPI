const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/user');

const adminRouter = require('./routes/admin');
const storeRouter = require('./routes/store');
const authRouter = require('./routes/auth');

const serverPort = process.env.SERVER_PORT;
const DBUser = process.env.DB_USER;
const DBPass = process.env.DB_PASS;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

// app.use((req, res, next) => {
//   User.findById('61cbad0dd6258d1f863f04f3')
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => console.log(err));
// });

app.use('/admin', adminRouter);
app.use('/store', storeRouter);
app.use('/auth', authRouter);

mongoose
  .connect(
    `mongodb+srv://${DBUser}:${DBPass}@carrentaldb.c5llj.mongodb.net/CarRentalDB?retryWrites=true&w=majority`
  )
  .then((results) => {
    app.listen(serverPort, () =>
      console.log(`Server & connection is running om PORT ${serverPort}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });
