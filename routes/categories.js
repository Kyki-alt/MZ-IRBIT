const express = require('express')
const pool = require('../db/db')

const router = express.Router()

// ================= GET =================
router.get('/', async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM categories
      ORDER BY id ASC
    `)

    res.json(result.rows)

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: 'Ошибка получения категорий'
    })
  }
})

// ================= CREATE =================
router.post('/', async (req, res) => {
  try {

    const { key_name, name } = req.body

    const result = await pool.query(`
      INSERT INTO categories (key_name, name)
      VALUES ($1, $2)
      RETURNING *
    `, [key_name, name])

    res.json(result.rows[0])

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: 'Ошибка создания категории'
    })
  }
})

// ================= UPDATE =================
router.put('/:id', async (req, res) => {
  try {

    const { key_name, name } = req.body

    const result = await pool.query(`
      UPDATE categories
      SET key_name = $1,
          name = $2
      WHERE id = $3
      RETURNING *
    `, [key_name, name, req.params.id])

    res.json(result.rows[0])

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: 'Ошибка обновления категории'
    })
  }
})

// ================= DELETE =================
router.delete('/:id', async (req, res) => {
  try {

    await pool.query(`
      DELETE FROM categories
      WHERE id = $1
    `, [req.params.id])

    res.json({ success: true })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: 'Ошибка удаления категории'
    })
  }
})

module.exports = router