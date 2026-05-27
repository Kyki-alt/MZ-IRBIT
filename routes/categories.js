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

    const { name } = req.body

    const result = await pool.query(`
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING *
    `, [name])

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

    const { name } = req.body

    const result = await pool.query(`
      UPDATE categories
      SET name = $1,
      WHERE id = $2
      RETURNING *
    `, [name, req.params.id])

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