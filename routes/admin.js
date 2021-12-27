const router = require('express').Router();

const adminController = require('../controllers/admin');

//add-vehicle ==> POST
router.post('/add-vehicle', adminController.postAddVehicle);

//get-vehicles ==> GET
router.get('/vehicles', adminController.getVehicles);

//get-vehicle ==> GET
router.get('/vehicle/:vehicleId', adminController.getVehicle);

//update-Vehicle ==> GET
router.get('/edit-vehicle/:vehicleId', adminController.getEditVehicle);

//update-Vehicle ==> POST
router.post('/edit-vehicle', adminController.postEditVehicle);

//del-Vehicle ==> POST
router.post('/delete-vehicle', adminController.postDeleteVehicle);

module.exports = router;