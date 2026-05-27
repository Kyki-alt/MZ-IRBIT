const express = require('express')
const pool = require('../db/db')

const router = express.Router()

const {
  createOrder
} = require('../controllers/orders.controller')

// СОЗДАНИЕ ЗАКАЗА
router.post('/', createOrder)

// ПОЛУЧИТЬ ВСЕ ЗАКАЗЫ
router.get('/', async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM orders
      ORDER BY id DESC
    `)

    res.json(result.rows)

  } catch (e) {

    console.log('ORDERS ERROR:', e)

    res.status(500).json({
      error: 'Ошибка получения заказов'
    })
  }
})

module.exports = router