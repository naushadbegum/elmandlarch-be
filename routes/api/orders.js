const express = require('express');
const router = express.Router();
const dataLayer = require('../../dal/orders');

router.get('/', async function (req, res) {
  
  const userId = req.session.user.id;
  const orders = await dataLayer.getAllOrdersByUserId(userId);

  res.send(orders);

});

module.exports = router;