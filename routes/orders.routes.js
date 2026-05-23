const express = require('express')

const router = express.Router()

const {

  createOrder,
  getOrderStatus

} = require(
  '../controllers/orders.controller'
)

router.post(
  '/',
  createOrder
)


module.exports = router