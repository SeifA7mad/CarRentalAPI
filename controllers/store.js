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
