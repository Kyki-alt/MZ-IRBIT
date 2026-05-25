const express = require('express')
const pool = require('../db/db')

const router = express.Router()

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        products.id,
        products.title,
        products.img,
        products.description,
        products.price,
        categories.key_name AS category
      FROM products
      JOIN categories
      ON products.category_id = categories.id
    `)

    res.json(result.rows)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router