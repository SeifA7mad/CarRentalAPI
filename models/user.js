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
  password: {
    type: String,
    required: true
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

userSchema.methods.addNewOrder = function (order) {
  const updatedOrders = [...this.reservations.orders];
  updatedOrders.push({ orderId: order });
  this.reservations.orders = updatedOrders;

  this.reservations.ongoingReturnDate = order.trackingDetails.returningDate;

  return this.save();
};

userSchema.methods.removeOrder = function (orderId) {
  const order = this.reservations.orders.find(
    (order) => order.orderId._id.toString() === orderId.toString()
  );

  if (
    order &&
    order.orderId.trackingDetails.returningDate.toString() !==
      this.reservations.ongoingReturnDate.toString()
  ) {
    return false;
  }

  const updatedOrders = this.reservations.orders.filter((order) => {
    return order.orderId._id.toString() !== orderId.toString();
  });

  this.reservations.orders = updatedOrders;
  this.reservations.ongoingReturnDate = '';
  this.save();
  return true;
};

module.exports = mongoose.model('User', userSchema);
