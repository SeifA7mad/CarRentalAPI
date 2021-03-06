const router = require('express').Router();

const adminController = require('../controllers/admin');

const isAuth = require('../middlewares/is-auth');

//add-vehicle ==> POST
router.post('/add-vehicle', isAuth.isAuthUser, adminController.postAddVehicle);

//get-vehicles ==> GET
router.get('/vehicles', isAuth.isAuthUser, adminController.getVehicles);

//get-vehicle ==> GET
router.get(
  '/vehicle/:vehicleId',
  isAuth.isAuthUser,
  adminController.getVehicle
);

//update-Vehicle ==> GET
router.get(
  '/edit-vehicle/:vehicleId',
  isAuth.isAuthUser,
  adminController.getEditVehicle
);

//update-Vehicle ==> POST
router.post(
  '/edit-vehicle',
  isAuth.isAuthUser,
  adminController.postEditVehicle
);

//del-Vehicle ==> POST
router.post(
  '/delete-vehicle',
  isAuth.isAuthUser,
  adminController.postDeleteVehicle
);

module.exports = router;
