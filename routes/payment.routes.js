const express = require('express')

const router = express.Router()

const {
  webmoneyResult,
  paymentSuccess,
  paymentFail

} = require('../controllers/payment.controller')

router.post('/webmoney/result', webmoneyResult)
router.get('/success', paymentSuccess)
router.get('/fail', paymentFail)

module.exports = router