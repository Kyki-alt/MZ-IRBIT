const express = require('express')
const pool = require('../db/db')
const multer = require('multer')
const path = require('path')
const upload = require('./middleware/upload')

const router = express.Router()

// ================= GET NEWS =================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM news
      WHERE is_active = true
      ORDER BY created_at DESC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// ================= CREATE NEWS =================
router.post('/', async (req, res) => {
  try {
    const { title, description, image } = req.body

    const result = await pool.query(`
      INSERT INTO news (title, description, image)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [title, description, image])

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка создания новости' })
  }
})

// ================= UPDATE NEWS =================
router.put('/:id', async (req, res) => {
  try {
    const { title, description, image } = req.body

    const result = await pool.query(`
      UPDATE news
      SET title = $1,
          description = $2,
          image = $3
      WHERE id = $4
      RETURNING *
    `, [title, description, image, req.params.id])

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка обновления новости' })
  }
})

// ================= DELETE (soft) =================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`
      UPDATE news
      SET is_active = false
      WHERE id = $1
    `, [req.params.id])

    res.json({ message: 'deleted' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка удаления' })
  }
})

// ================= UPLOAD IMAGE =================
router.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    imageUrl: `/uploads/news/${req.file.filename}`
  })
})

module.exports = router