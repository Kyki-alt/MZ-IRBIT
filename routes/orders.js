const express = require('express')
const pool = require('../db/db')

const router = express.Router()

// активные заказы
router.get('/', async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT *
      FROM orders
      WHERE is_archived = false
      ORDER BY created_at DESC
    `)

    res.json(orders.rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})


// архив
router.get('/archived', async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT *
      FROM orders
      WHERE is_archived = true
      ORDER BY created_at DESC
    `)

    res.json(orders.rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})


// архивировать заказ
router.put('/archive/:id', async (req, res) => {
  try {
    await pool.query(`
      UPDATE orders
      SET is_archived = true
      WHERE id = $1
    `, [req.params.id])

    res.json({ message: 'archived' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка' })
  }
})

// восстановить из архива
router.put('/restore/:id', async (req, res) => {
  try {
    await pool.query(`
      UPDATE orders
      SET is_archived = false
      WHERE id = $1
    `, [req.params.id])

    res.json({ message: 'restored' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка' })
  }
})

module.exports = router