const router = require('express').Router();

const storeController = require('../controllers/store');

const isAuth = require('../middlewares/is-auth');

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
router.post('/place-order', isAuth, storeController.postPlaceOrder);

//cancel-order ==> POST
router.post('/cancel-order', isAuth, storeController.postCancelOrder);

//get-orders ==> GET
router.get('/orders', isAuth, storeController.getOrders);

//update-Order ==> GET
router.get('/edit-order/:orderId', isAuth, storeController.getEditOrder);

// update-Order ==> POST
router.post('/edit-order', isAuth, storeController.postEditOrder);

module.exports = router;
