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

      SELECT
        orders.*,

        COALESCE(

          json_agg(

            json_build_object(

              'product_id', products.id,
              'title', products.title,
              'quantity', order_items.quantity,
              'price', order_items.price,
              'img', products.img

            )

          )

          FILTER (
            WHERE products.id IS NOT NULL
          ),

          '[]'

        ) AS items

      FROM orders

      LEFT JOIN order_items
        ON order_items.order_id = orders.id

      LEFT JOIN products
        ON products.id = order_items.product_id

      GROUP BY orders.id

      ORDER BY orders.id DESC

    `)

    res.json(result.rows)

  } catch (e) {

    console.log(e)

    res.status(500).json({
      error: 'Ошибка получения заказов'
    })
  }
})

router.patch('/:id/status', async (req, res) => {

  try {

    const { status } = req.body

    const result = await pool.query(
      `
      UPDATE orders
      SET payment_status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, req.params.id]
    )

    res.json(result.rows[0])

  } catch (e) {

    console.log(e)

    res.status(500).json({
      error: 'Ошибка обновления статуса'
    })
  }
})

module.exports = router