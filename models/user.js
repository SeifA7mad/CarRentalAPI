const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_APIKEY);

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

userSchema.methods.makePayment = async function (paymentDetails, amountToPay) {
  const { cardNumber, expiryMonth, expiryYear, cardCvc } = paymentDetails;
  try {
    const paymentToken = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: expiryMonth,
        exp_year: expiryYear,
        cvc: cardCvc,
      },
    });

    const charge = await stripe.charges.create({
      amount: amountToPay,
      currency: 'usd',
      source: paymentToken.id,
      receipt_email: this.email,
      capture: true,
    });

    return charge;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.addNewOrder = function (order) {
  const updatedOrders = [...this.reservations.orders];
  updatedOrders.push({orderId: order });
  this.reservations.orders = updatedOrders;

  this.reservations.ongoingReturnDate = order.trackingDetails.returningDate;

  return this.save();
};

module.exports = mongoose.model('User', userSchema);
