const Vehicle = require('../models/vehicle');
const Order = require('../models/order');

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

//HELPER FUNCTION CREATE ORDER
const createOrderHelperFunction = (orderDetails) => {
  const {
    pickingDate,
    returningDate,
    pickingLocation,
    requestDriver,
    requestInsurance,
    totalPrice,
    charge,
    user,
    vehicle,
  } = orderDetails;
  const date = new Date().toLocaleDateString();

  const order = new Order({
    vehicle: vehicle,
    user: {
      name: user.name,
      userId: user,
    },
    trackingDetails: {
      status: 'preparing',
      pickingDate: pickingDate,
      pickingLocation: pickingLocation,
      returningDate: returningDate,
    },
    additionalServices: {
      requestDriver: requestDriver,
      requestInsurance: requestInsurance,
    },
    totalPrice: totalPrice,
    orderDate: date,
    invoice: charge,
  });

  return order.save();
};

//POST PLACEORDER
exports.postPlaceOrder = (req, res, next) => {
  const ongoingReturnDate = req.user.reservations.ongoingReturnDate;

  if (ongoingReturnDate != '') {
    return res.redirect('/store');
  }

  const vehicleId = req.body.vehicleId;

  const { pickingDate, returningDate, requestDriver, requestInsurance } =
    req.body.orderDetails;

  const pickingDateObj = new Date(pickingDate);
  const returningDateObj = new Date(returningDate);

  // get the vehilce reserved days
  const reservedDays =
    (returningDateObj.getTime() - pickingDateObj.getTime()) /
    (1000 * 3600 * 24);

  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      const totalPrice =
        reservedDays * vehicle.price +
        (requestDriver ? 50 : 0) +
        (requestInsurance ? 100 : 0);

      req.user
        .makePayment(req.body.paymentDetails, totalPrice)
        .then((charge) => {
          createOrderHelperFunction({
            ...req.body.orderDetails,
            totalPrice: totalPrice,
            charge: charge,
            user: req.user,
            vehicle: vehicle,
          })
            .then((order) => {
              req.user
                .addNewOrder(order)
                .then((results) => {
                  vehicle.useVehicle();
                  res.redirect('/orders');
                })
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
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
