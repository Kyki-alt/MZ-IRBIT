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

// архивировать
router.patch('/:id/archive', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE orders
      SET is_archived = TRUE
      WHERE id = $1
      RETURNING *
    `, [req.params.id])

    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: 'Ошибка архивации' })
  }
})


//  восстановить
router.patch('/:id/restore', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE orders
      SET is_archived = FALSE
      WHERE id = $1
      RETURNING *
    `, [req.params.id])

    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: 'Ошибка восстановления' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE id = $1
      `,
      [req.params.id]
    )

    if (!orderResult.rows.length) {
      return res.status(404).json({
        error: 'Заказ не найден'
      })
    }

    const itemsResult = await pool.query(
      `
      SELECT
        oi.product_id,
        oi.quantity,
        oi.price,
        p.title
      FROM order_items oi
      LEFT JOIN products p
      ON p.id = oi.product_id
      WHERE oi.order_id = $1
      `,
      [req.params.id]
    )

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      error: 'Ошибка получения заказа'
    })
  }
})

module.exports = router