const router = require('express').Router();

const storeController = require('../controllers/store');

//get-vehicles ==> GET
router.get('/vehicles', storeController.getVehicles);

//get-vehicle ==> POST
router.get('/vehicle/:vehicleId', storeController.getVehicle);

//recomend-vehicle
router.get(
  '/recommend-vehicle/:recommendationType',
  storeController.getRecommendVehicle
);

router.post('/place-order', storeController.postPlaceOrder);

module.exports = router;
