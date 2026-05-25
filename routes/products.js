const express = require('express')
const pool = require('../db/db')
const upload = require('../middlewares/upload')

const router = express.Router()

// =======================
// GET ALL PRODUCTS
// =======================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        products.id,
        products.title,
        products.img,
        products.description,
        products.price,
        products.stock,
        products.is_active,
        products.category_id,
        categories.key_name AS category
      FROM products
      LEFT JOIN categories
      ON products.category_id = categories.id
      WHERE products.is_deleted = FALSE
      ORDER BY products.id DESC
    `)

    res.json(result.rows)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})


// =======================
// CREATE PRODUCT (POST)
// =======================
router.post('/', async (req, res) => {
  try {
    const {
      title,
      price,
      stock,
      description,
      is_active,
      img,
      category_id
    } = req.body

    if (price < 0) {
      return res.status(400).json({
        error: 'Цена не может быть отрицательной'
      })
    }

    const parsedCategoryId =
  category_id === '' ? null : Number(category_id)

    const result = await pool.query(
      `
      INSERT INTO products
      (title, price, stock, description, is_active, img, category_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        title,
        price,
        stock,
        description,
        is_active,
        img,
        parsedCategoryId
      ]
    )

    res.json(result.rows[0])

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка добавления товара' })
  }
})

// =======================
// UPDATE PRODUCT (PUT)
// =======================
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      price,
      stock,
      description,
      is_active,
      img,
      category_id
    } = req.body

    if (price < 0) {
      return res.status(400).json({
        error: 'Цена не может быть отрицательной'
      })
    }

    const parsedCategoryId =
    category_id === '' ? null : Number(category_id)

    const result = await pool.query(
      `
      UPDATE products
      SET
        title = $1,
        price = $2,
        stock = $3,
        description = $4,
        is_active = $5,
        img = $6,
        category_id = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        title,
        price,
        stock,
        description,
        is_active,
        img,
        parsedCategoryId,
        req.params.id
      ]
    )

    res.json(result.rows[0])

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Ошибка обновления товара' })
  }
})


// =======================
// DELETE PRODUCT
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE products
      SET is_deleted = TRUE,
          deleted_at = NOW()
      WHERE id = $1
      `,
      [req.params.id]
    )

    res.json({ success: true })

  } catch (e) {
    res.status(500).json({ error: 'Ошибка архивации' })
  }
})

router.patch('/:id/restore', async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE products
      SET is_deleted = FALSE,
          deleted_at = NULL
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    )

    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: 'Ошибка восстановления' })
  }
})

router.get('/search', async (req, res) => {
  const { q } = req.query

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM products
      WHERE is_deleted = FALSE
        AND title ILIKE $1
      ORDER BY id DESC
      `,
      [`%${q}%`]
    )

    res.json(result.rows)
  } catch (e) {
    res.status(500).json({ error: 'Ошибка поиска' })
  }
})

router.get('/categories', async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM categories ORDER BY id`
  )

  res.json(result.rows)
})

router.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    imageUrl: `/uploads/${req.file.filename}`
  })
})

module.exports = router