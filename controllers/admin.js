const Vehicle = require('../models/vehicle');

//POST VEHICLE
exports.postAddVehicle = (req, res, next) => {
  const title = req.body.title;
  const manufacture = req.body.manufacture;
  const type = req.body.type;
  const description = req.body.description;
  const rentalInfo = req.body.rentalInfo;
  const price = req.body.price;
  const year = req.body.year;
  const imgURL = req.body.imgURL;
  const availableCount = req.body.availableCount;
  const recommendedFor = req.body.recommendedFor;

  const date = new Date().toLocaleDateString();

  const vehicle = new Vehicle({
    title: title,
    manufacture: manufacture,
    type: type,
    description: description,
    rentalInfo: rentalInfo,
    price: price,
    year: year,
    imgURL: imgURL,
    availableCount: availableCount,
    recommendedFor: recommendedFor,
    createdAt: date,
  });

  vehicle
    .save()
    .then((vehicle) => {
      console.log('vehilce added');
      res.status(200).json(vehicle);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//GET VEHICLES
exports.getVehicles = (req, res, next) => {
  Vehicle.find({}, 'title imgURL year availableCount')
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

  Vehicle.findById(vehicleId)
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

//GET EDIT-VEHICLE
exports.getEditVehicle = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    const error = new Error('Not in Edit Mode');
    error.statusCode = 422;
    throw error;
  }
  const vehicleId = req.params.vehicleId;

  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      if (!vehicle) {
        const error = new Error('Please enter a valid vehicle id');
        error.statusCode = 422;
        throw error;
      }
      res.status(200).json(vehicle);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//POST EDIT-VEHICLE
exports.postEditVehicle = (req, res, next) => {
  const vehicleId = req.body.vehicleId;
  const updatedType = req.body.type;
  const updatedDescription = req.body.description;
  const updatedRentalInfo = req.body.rentalInfo;
  const updatedPrice = req.body.price;
  const updatedImgURL = req.body.imgURL;
  const updatedAvailableCount = req.body.availableCount;

  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      if (!vehicle) {
        const error = new Error('Please enter a valid vehicle id');
        error.statusCode = 422;
        throw error;
      }
      vehicle.type = updatedType;
      vehicle.description = updatedDescription;
      vehicle.rentalInfo = updatedRentalInfo;
      vehicle.price = updatedPrice;
      vehicle.imgURL = updatedImgURL;
      vehicle.availableCount = updatedAvailableCount;
      vehicle
        .save()
        .then((newVehicle) => {
          console.log('VEHICLE UPDATED');
          res.status(200).json(newVehicle);
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

//POST DELETE-VEHICLE
exports.postDeleteVehicle = (req, res, next) => {
  const vehicleId = req.body.vehicleId;

  Vehicle.findByIdAndDelete(vehicleId)
    .then(() => {
      console.log('VEHICLE DELETED');
      res.status(200).json({message: 'VEHICLE DELETED!'});
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
