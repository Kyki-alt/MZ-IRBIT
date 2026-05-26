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

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM orders
      ORDER BY id DESC
    `)

    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: 'Ошибка получения заказов' })
  }
})

module.exports = router