const router = require('express').Router();

const storeController = require('../controllers/store');

//get-vehicles ==> GET
router.get('/vehicles', storeController.getVehicles);

//get-vehicle ==> POST
router.get('/vehicle/:vehicleId', storeController.getVehicle);

//recomend-vehicle ==> GET
router.get(
  '/recommend-vehicle/:recommendationType',
  storeController.getRecommendVehicle
);

//place-order ==> POST
router.post('/place-order', storeController.postPlaceOrder);

//cancel-order ==> POST
router.post('/cancel-order', storeController.postCancelOrder);

//get-orders ==> GET
router.get('/orders', storeController.getOrders);

module.exports = router;
