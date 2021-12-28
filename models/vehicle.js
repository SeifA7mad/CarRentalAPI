const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  manufacture: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rentalInfo: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  imgURL: [],
  availableCount: {
    type: Number,
    required: true,
  },
  recommendedFor: {
    type: String,
    required: false
  },
  createdAt: {
    type: String
  }
});

vehicleSchema.methods.useVehicle = function() {
  let availableCount = this.availableCount;
  const updatedAvailableCount = --availableCount;

  this.availableCount = updatedAvailableCount;

  return this.save();
}

vehicleSchema.methods.unuseVehicle = function () {
  let availableCount = this.availableCount;
  const updatedAvailableCount = ++availableCount;

  this.availableCount = updatedAvailableCount;

  return this.save();
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
