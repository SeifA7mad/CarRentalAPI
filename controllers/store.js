const stripe = require('stripe')(process.env.STRIPE_APIKEY);

const Vehicle = require('../models/vehicle');
const Order = require('../models/order');
const User = require('../models/user');

//GET VEHICLES
exports.getVehicles = (req, res, next) => {
  const filterMode = req.query.filter;
  const sortMode = req.query.sort;

  Vehicle.find({ availableCount: { $gt: 0 } }, 'title imgURL year price')
    .sort(filterMode ? [[`${filterMode}`, `${sortMode}`]] : null)
    .then((vehicles) => {
      res.status(200).json(vehicles);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//GET VEHICLE
exports.getVehicle = (req, res, next) => {
  const vehicleId = req.params.vehicleId;

  Vehicle.findById(vehicleId, '-createdAt -availableCount -recommendedFor')
    .then((vehicle) => {
      res.status(200).json(vehicle);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
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
      res.status(200).json(vehicles);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
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
    invoice: [charge],
  });

  return order.save();
};

//HELPER FUNTION MAKE PAYMENT
const makePaymentHandler = async (paymentDetails, amountToPay) => {
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
      capture: true,
    });

    return charge;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//POST PLACEORDER
exports.postPlaceOrder = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      console.log(user);
      const ongoingReturnDate = user.reservations.ongoingReturnDate;

      if (ongoingReturnDate != '') {
        const error = new Error('you have ongoing reservation');
        error.statusCode = 422;
        throw error;
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
        const error = new Error('returning Date must be after picking date');
        error.statusCode = 422;
        throw error;
      }

      Vehicle.findById(vehicleId)
        .then((vehicle) => {
          const totalPrice =
            reservedDays * vehicle.price +
            (requestDriver ? 50 : 0) +
            (requestInsurance ? 100 : 0);

          makePaymentHandler(req.body.paymentDetails, totalPrice)
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
                    currency: charge.currency,
                  },
                  user: user,
                  vehicle: {
                    _id: vehicle._id,
                    title: vehicle.title,
                    price: vehicle.price,
                  },
                });
                await user.addNewOrder(order);
                vehicle.useVehicle();
                console.log('order placed');
                return res.status(200).json({ message: 'ORDER PLACED' });
              } catch (err) {
                if (!err.statusCode) {
                  err.statusCode = 500;
                }
                next(err);
              }
            })
            .catch((err) => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//POST CANCELORDER
exports.postCancelOrder = (req, res, next) => {
  const orderId = req.body.orderId;

  User.findById(req.userId)
    .then((user) => {
      user.populate('reservations.orders.orderId').then((user) => {
        const orderRemoved = user.removeOrder(orderId);
        if (!orderRemoved) {
          const error = new Error('not an ongoing order to be cancel');
          error.statusCode = 422;
          throw error;
        }

        Order.findById(orderId)
          .then(async (order) => {
            try {
              const vehicleId = order.vehicle._id;
              stripe.refunds.create({
                charge: order.invoice[0].id,
              });
              order.refundOrder();
              const newVehicle = await Vehicle.findById(vehicleId);
              newVehicle.unuseVehicle();
              console.log('order canceled');
              return res.status(200).json({ meesage: 'ORDER CANCELED' });
            } catch (err) {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            }
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//GET ORDERS
exports.getOrders = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      user
        .populate('reservations.orders.orderId')
        .then((user) => {
          return res.status(200).json(user.reservations.orders);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//GET EDITORDER
exports.getEditOrder = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    const error = new Error('Not in Edit Mode');
    error.statusCode = 422;
    throw error;
  }
  const orderId = req.params.orderId;

  User.findById(req.userId)
    .then((user) => {
      const isOrderInUser = user.reservations.orders.find(
        (order) => order.orderId._id.toString() === orderId.toString()
      );

      if (!isOrderInUser) {
        const error = new Error('Please enter a valid order id');
        error.statusCode = 422;
        throw error;
      }

      Order.findById(orderId)
        .then((order) => {
          if (!order) {
            const error = new Error('Please enter a valid order id');
            error.statusCode = 422;
            throw error;
          }
          return res.status(200).json(order);
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//POST EDITORDER
exports.postEditOrder = (req, res, next) => {
  const orderId = req.body.orderId;

  User.findById(req.userId)
    .then((user) => {
      const isOrderInUser = user.reservations.orders.find(
        (order) => order.orderId._id.toString() === orderId.toString()
      );

      if (!isOrderInUser) {
        const error = new Error('Please enter a valid order id');
        error.statusCode = 422;
        throw error;
      }

      const updatedPickingLocation = req.body.pickingLocation;
      // const updatedReturningDate = req.body.returningDate;
      const updatedRequestDriver = req.body.requestDriver;
      const updatedRequestInsurance = req.body.requestInsurance;

      Order.findById(orderId)
        .then(async (order) => {
          let updatedTotalPrice = order.totalPrice;
          let additionalPrice = 0;
          updatedRequestDriver.toString() !==
          order.additionalServices.requestDriver.toString()
            ? (additionalPrice += 50)
            : null;
          updatedRequestInsurance.toString() !==
          order.additionalServices.requestInsurance.toString()
            ? (additionalPrice += 100)
            : null;

          updatedTotalPrice += additionalPrice;

          let charge = null;
          if (additionalPrice > 0 && req.body.paymentDetails) {
            try {
              charge = await makePaymentHandler(
                req.body.paymentDetails,
                additionalPrice
              );
            } catch (err) {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            }
          }
          order.trackingDetails.requestDriver = updatedRequestDriver;
          order.trackingDetails.requestInsurance = updatedRequestInsurance;
          order.trackingDetails.pickingLocation = updatedPickingLocation;
          order.totalPrice = updatedTotalPrice;
          order.invoice.push(charge);
          order
            .save()
            .then((newOrder) => {
              console.log('Order UPDATED');
              return res.status(200).json(newOrder);
            })
            .catch((err) => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
        })
        .catch((err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
