const mongoose = require('mongoose');
const vehicle = require('../models/vehicle');

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

  Vehicle.findById(vehicleId, '-createdAt -availableCount')
    .then((vehicle) => {
      res.send(vehicle);
    })
    .catch((err) => console.log(err));
};
