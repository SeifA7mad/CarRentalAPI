const vehicle = require('../models/vehicle');
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
    createdAt: date,
  });

  vehicle
    .save()
    .then((results) => {
      console.log('vehilce added');
      res.redirect('/admin/vechiles');
    })
    .catch((err) => {
      console.log(err);
    });
};

//GET VEHICLES
exports.getVehicles = (req, res, next) => {
  Vehicle.find()
    .select('title imgURL year availableCount')
    .then((vehicles) => {
      res.send(vehicles);
    })
    .catch((err) => console.log(err));
};

//GET VEHICLE
exports.getVehicle = (req, res, next) => {
  const vehicleId = req.params.vehicleId;

  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      res.send(vehicle);
    })
    .catch((err) => console.log(err));
};

//GET EDIT-VEHICLE
exports.getEditVehicle = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const vehicleId = req.params.vehicleId;

  Vehicle.findById(vehicleId)
    .then((vehicle) => {
      if (!vehicle) {
        return res.redirect('/');
      }
      res.send(vehicle);
    })
    .catch((err) => console.log(err));
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
      vehicle.type = updatedType;
      vehicle.description = updatedDescription;
      vehicle.rentalInfo = updatedRentalInfo;
      vehicle.price = updatedPrice;
      vehicle.imgURL = updatedImgURL;
      vehicle.availableCount = updatedAvailableCount;
      vehicle.save();
    })
    .then((results) => {
      console.log('VEHICLE UPDATED');
      res.redirect('/admin/vechiles');
    })
    .catch((err) => console.log(err));
};

//POST DELETE-VEHICLE
exports.postDeleteVehicle = (req, res, next) => {
  const vehicleId = req.body.vehicleId;

  Vehicle.findByIdAndDelete(vehicleId)
    .then(() => {
      console.log('VEHICLE DELETED');
      res.redirect('/admin/vehicles');
    })
    .catch((err) => console.log(err));
};
