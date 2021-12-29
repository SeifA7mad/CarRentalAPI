const stripe = require('stripe')(process.env.STRIPE_APIKEY);
const Vehicle = require('../models/vehicle');
const Order = require('../models/order');
const order = require('../models/order');

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
    return res.send({
      err: 'you have ongoing reservation',
    });
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

  if (reservedDays <= 0) {
    return res.send({
      err: 'returning Date must be after picking date',
    });
  }
  
  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      const totalPrice =
        reservedDays * vehicle.price +
        (requestDriver ? 50 : 0) +
        (requestInsurance ? 100 : 0);

      req.user
        .makePayment(req.body.paymentDetails, totalPrice)
        .then(async (charge) => {
          try {
            const order = await createOrderHelperFunction({
              ...req.body.orderDetails,
              totalPrice: totalPrice,
              charge: {
                id: charge.id,
                amount: charge.amount,
                paid: charge.paid,
                refunded: charge.refunded,
                receipt_email: charge.receipt_email,
                currency: charge.currency,
              },
              user: req.user,
              vehicle: {
                _id: vehicle._id,
                title: vehicle.title,
                price: vehicle.price,
              },
            });
            req.user.addNewOrder(order);
            vehicle.useVehicle();
            console.log('order placed');
            return res.redirect('/store/orders');
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

//POST CANCELORDER
exports.postCancelOrder = (req, res, next) => {
  const orderId = req.body.orderId;

  req.user.populate('reservations.orders.orderId').then((user) => {
    const orderRemoved = req.user.removeOrder(orderId);
    if (!orderRemoved) {
      return res.send({
        err: 'not an ongoing order to be cancel',
      });
    }

    Order.findById(orderId)
      .then(async (order) => {
        try {
          const vehicleId = order.vehicle._id;
          stripe.refunds.create({
            charge: order.invoice.id,
          });
          order.refundOrder();
          const newVehicle = await Vehicle.findById(vehicleId);
          newVehicle.unuseVehicle();
          console.log('order canceled');
          return res.redirect('/store/orders');
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => console.log(err));
  });
};

//GET ORDERS
exports.getOrders = (req, res, next) => {
  req.user
    .populate('reservations.orders.orderId')
    .then((user) => {
      res.send(user.reservations.orders);
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
