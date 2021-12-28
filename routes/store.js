const router = require('express').Router();

const storeController = require('../controllers/store');

//get-vehicles ==> GET
router.get('/vehicles', storeController.getVehicles);

//get-vehicle ==> POST
router.get('/vehicle/:vehicleId', storeController.getVehicle);


module.exports = router;