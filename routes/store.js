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

//edit-order ==> GET
router.get('/edit-order/:orderId', isAuth, storeController.getEditOrder);

//edit-order ==> POST
router.post('/edit-order', isAuth, storeController.postEditOrder);

//retrive-mechanic ==> POST
// router.post('/retrive-mechanics', storeController.postRetriveMechanics);

module.exports = router;
