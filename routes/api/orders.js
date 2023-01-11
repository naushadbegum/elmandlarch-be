const express = require('express');
const router = express.Router();
const dataLayer = require('../../dal/orders');

router.get('/', async function (req, res) {
  
  const userId = req.user.id;
  const orders = await dataLayer.getAllOrdersByUserId(userId);

  res.send(orders);

});

module.exports = router;