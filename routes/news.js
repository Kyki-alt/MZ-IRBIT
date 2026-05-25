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

router.post('/upload', upload.single('image'), (req, res) => {
  const type = req.body.type || 'common'

  res.json({
    imageUrl: `${process.env.SERVER_URL}/uploads/${type}/${req.file.filename}`
  })
})

module.exports = router