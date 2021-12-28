const stripe = require('stripe')(process.env.STRIPE_APIKEY);

const Vehicle = require('../models/vehicle');

//GET VEHICLES
exports.getVehicles = (req, res, next) => {
  const filterMode = req.query.filter;
  const sortMode = req.query.sort;

  Vehicle.find({ availableCount: { $gt: 0 } }, 'title imgURL year price')
    .sort(filterMode ? [[`${filterMode}`, `${sortMode}`]] : null)
    .then((vehicles) => {
      res.send(vehicles);
    })
    .catch((err) => console.log(err));
};

//GET VEHICLE
exports.getVehicle = (req, res, next) => {
  const vehicleId = req.params.vehicleId;

  Vehicle.findById(vehicleId, '-createdAt -availableCount -recommendedFor')
    .then((vehicle) => {
      res.send(vehicle);
    })
    .catch((err) => console.log(err));
};

//GET RecommendVehicle
exports.getRecommendVehicle = (req, res, next) => {
  const recommendationType = req.params.recommendationType;
  const editedRecommendationType =
    `${recommendationType}`.charAt(0).toUpperCase() +
    `${recommendationType}`.slice(1).toLowerCase();

  Vehicle.find(
    { recommendedFor: editedRecommendationType },
    '-createdAt -availableCount -recommendedFor'
  )
    .then((vehicles) => {
      res.send(vehicles);
    })
    .catch((err) => console.log(err));
};

exports.postPlaceOrder = async (req, res, next) => {
  const ongoingReturnDate = req.user.reservations.ongoingReturnDate;

  if (ongoingReturnDate != null) {
    return res.redirect('/store');
  }

  const vehicleId = req.body.vehicleId;

  const {
    pickingDate,
    returningDate,
    pickingLocation,
    requestDriver,
    requestInsurance,
  } = req.body.orderDetails;

  const pickingDateObj = new Date(pickingDate);
  const returningDateObj = new Date(returningDate);

  const reservedDays =
    (returningDateObj.getTime() - pickingDateObj.getTime()) /
    (1000 * 3600 * 24);

  const { cardNumber, expiryMonth, expiryYear, cardCvc } =
    req.body.paymentDetails;

  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: expiryMonth,
        exp_year: expiryYear,
        cvc: cardCvc,
      },
    });

    const vehicle = await Vehicle.findById(vehicleId);
    const totalPrice =
      reservedDays * vehicle.price +
      (requestDriver ? 50 : 0) +
      (requestInsurance ? 100 : 0);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice,
      currency: 'usd',
      payment_method_types: ['card'],
      payment_method: paymentMethod.id,
      receipt_email: req.user.email,
    });

    const paymentIntentConfirmation = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      { payment_method: paymentMethod.id }
    );

    console.log(paymentIntentConfirmation);
  } catch (err) {
    console.log(err);
  }

  // Vehicle.findById(vehicleId)
  //   .then((vehicle) => {
  //     const totalPrice =
  //       reservedDays * vehicle.price +
  //       (requestDriver ? 50 : 0) +
  //       (requestInsurance ? 100 : 0);
  //   })
  //   .catch((err) => console.log(err));
};

// stripe.checkout.sessions
//   .create({
//     success_url: `${process.env.DOMAIN}/store/orders/success`,
//     cancel_url: `${process.env.DOMAIN}/store/orders/cancel`,
//     line_items: [
//       {
//         price: 'price_1KBjReGdVSlBx0kCIjozI0sr',
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     payment_method_types: 'card'
//   })
//   .then((payment) => {
//     console.log(payment);
//   })
//   .catch((err) => console.log(err));

// const payout = await stripe.payouts.create({
//       amount: totalPrice,
//       currency: 'usd',
//     });
