const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  vehicle: {
    type: Object,
    required: true,
  },
  user: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  trackingDetails: {
    status: {
      type: String,
      required: true,
    },
    pickingDate: {
      type: String,
      required: true,
    },
    pickingLocation: {
      type: String,
      required: true,
    },
    returningDate: {
      type: String,
      required: true,
    },
  },
  additionalServices: {
    requestDriver: {
      type: Boolean,
      required: true,
    },
    requestInsurance: {
      type: Boolean,
      required: true,
    },
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Order', orderSchema);