const express = require('express')
const pool = require('../db/db')

const router = express.Router()

// получить все новости
router.get('/', async (req, res) => {

  try {

    const news = await pool.query(`
      SELECT *
      FROM news
      WHERE is_active = true
      ORDER BY created_at DESC
    `)

    res.json(news.rows)

  } catch (err) {

    console.error(err)

    res.status(500).json({
      message: 'Ошибка сервера'
    })

  }

})

module.exports = router