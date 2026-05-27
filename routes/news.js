const express = require('express')
const pool = require('../db/db')
const upload = require('../middlewares/upload')

const router = express.Router()

// =======================
// GET NEWS
// =======================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM news
      WHERE is_deleted = FALSE OR is_deleted IS NULL
      ORDER BY id DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// =======================
// CREATE NEWS
// =======================
router.post('/', async (req, res) => {
  try {
    const { title, description, img } = req.body

    const result = await pool.query(
      `
      INSERT INTO news (title, description, img)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, description, img]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка добавления новости' })
  }
})

// =======================
// UPDATE NEWS
// =======================
router.put('/:id', async (req, res) => {
  try {
    const { title, description, img } = req.body

    const result = await pool.query(
      `
      UPDATE news
      SET title = $1,
          description = $2,
          img = $3
      WHERE id = $4
      RETURNING *
      `,
      [title, description, img, req.params.id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка обновления' })
  }
})

// =======================
// DELETE NEWS
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE news
      SET is_deleted = TRUE
      WHERE id = $1
      `,
      [req.params.id]
    )

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка удаления' })
  }
})

// =======================
// UPLOAD (КАК В ТОВАРАХ)
// =======================
router.post('/upload', upload.single('image'), (req, res) => {
  const type = req.body.type || 'news'

  res.json({
    imageUrl: `/uploads/${type}/${req.file.filename}`
  })
})

module.exports = router