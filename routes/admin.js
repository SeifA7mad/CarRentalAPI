const router = require('express').Router();

const adminController = require('../controllers/admin');

const isAuth = require('../middlewares/is-auth');

//add-vehicle ==> POST
router.post('/add-vehicle', isAuth, adminController.postAddVehicle);

//get-vehicles ==> GET
router.get('/vehicles', isAuth, adminController.getVehicles);

//get-vehicle ==> GET
router.get('/vehicle/:vehicleId', isAuth, adminController.getVehicle);

//update-Vehicle ==> GET
router.get('/edit-vehicle/:vehicleId', isAuth, adminController.getEditVehicle);

//update-Vehicle ==> POST
router.post('/edit-vehicle', isAuth, adminController.postEditVehicle);

//del-Vehicle ==> POST
router.post('/delete-vehicle', isAuth, adminController.postDeleteVehicle);

module.exports = router;
