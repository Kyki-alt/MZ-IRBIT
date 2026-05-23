require('dotenv').config()

console.log(
  'SECRET:',
  process.env.WM_SECRET_KEY
)

const express = require('express')
const cors = require('cors')
const pool = require('./db/db')

const app = express()

app.use(cors())
app.use(express.urlencoded({
  extended: true
}))

app.use(express.json())

const ordersRoutes = require('./routes/orders.routes')
app.use('/orders', ordersRoutes)

const paymentRoutes = require('./routes/payment.routes')
app.use('/payment', paymentRoutes)

console.log(req.headers['content-type'])

// Проверка сервера
app.get('/', (req, res) => {
  res.send('Server works!')
})

// Получить товары
app.get('/products', async (req, res) => {

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
      console.error(error.message)
      console.error(error.stack)

      res.status(500).json({
        error: 'Ошибка сервера'
      })
    }
})

// Получить категории
app.get('/categories', async (req, res) => {

  try {

    const result =
      await pool.query(
        'SELECT * FROM categories'
      )

    res.json(result.rows)

    } catch (error) {

      console.error(error)
      console.error(error.message)
      console.error(error.stack)

      res.status(500).json({
        error: 'Ошибка сервера'
      })
    }
})

// Получить новости
app.get('/news', async (req, res) => {

  try {

    const result =
      await pool.query(
        'SELECT * FROM news ORDER BY id DESC'
      )

    res.json(result.rows)

    } catch (error) {

      console.error(error)
      console.error(error.message)
      console.error(error.stack)

      res.status(500).json({
        error: 'Ошибка сервера'
      })
    }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})