const express = require('express')

const router = express.Router()

const {

  webmoneyResult

} = require(
  '../controllers/payment.controller'
)

router.get(
  '/webmoney/result',
  (req, res) => {
    res.send('RESULT URL WORKS')
  }
)

router.post(
  '/webmoney/result',
  webmoneyResult
)

module.exports = router