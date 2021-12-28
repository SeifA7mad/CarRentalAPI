const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  reservations: {
    orders: [
      {
        orderId: {
          type: Schema.Types.ObjectId,
          ref: 'Order',
          required: true,
        },
      },
    ],
    ongoingReturnDate: {
      type: String,
      required: false,
    },
  },
});


module.exports = mongoose.model('User', userSchema);