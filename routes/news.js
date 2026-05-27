const express = require('express')
const pool = require('../db/db')
const multer = require('multer')
const path = require('path')

const router = express.Router()

// multer (если ещё нет)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// GET новости
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
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ➕ ДОБАВИТЬ НОВОСТЬ
router.post('/', async (req, res) => {
  try {
    const { title, description, image } = req.body

    const result = await pool.query(
      `INSERT INTO news (title, description, image)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, image]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка добавления новости' })
  }
})

// загрузка картинки
router.post('/upload', upload.single('image'), (req, res) => {
  const type = req.body.type || 'common'

  res.json({
    imageUrl: `/uploads/${type}/${req.file.filename}`
  })
})

module.exports = router