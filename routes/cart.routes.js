const express = require('express')
const router = express.Router()

const { validateCart } = require('../controllers/cart.controller')

router.post('/validate', validateCart)

module.exports = router