const express = require('express')
const pool = require('../db/db')

const router = express.Router()

// получить все товары
router.get('/', async (req, res) => {

  try {

    const products = await pool.query(`
      SELECT *
      FROM products
      WHERE is_active = true
      ORDER BY created_at DESC
    `)

    res.json(products.rows)

  } catch (err) {

    console.error(err)

    res.status(500).json({
      message: 'Ошибка сервера'
    })

  }

})

module.exports = router