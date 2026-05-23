const express = require('express')

const router = express.Router()

const {
  webmoneyResult,
  paymentFail

} = require('../controllers/payment.controller')

router.post('/webmoney/result', webmoneyResult)
router.get('/fail', paymentFail)

module.exports = router