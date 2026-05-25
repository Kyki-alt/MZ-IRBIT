require('dotenv').config()

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

const adminRoutes = require('./routes/admin')
app.use('/admin', adminRoutes)

const path = require('path')
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
)

const productsRouter = require('./routes/products')
app.use('/api/products', productsRouter)

// Проверка сервера
app.get('/', (req, res) => {
  res.send('Server works!')
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