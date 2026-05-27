require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')

const pool = require('./db/db')

const app = express()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const UPLOAD_DIR = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(UPLOAD_DIR))

const ordersRoutes = require('./routes/orders.routes')
app.use('/orders', ordersRoutes)

const paymentRoutes = require('./routes/payment.routes')
app.use('/payment', paymentRoutes)

const adminRoutes = require('./routes/admin')
app.use('/admin', adminRoutes)

const createAdminRoutes = require('./routes/createAdmin')
app.use('/admin', createAdminRoutes)

const productsRouter = require('./routes/products')
app.use('/api/products', productsRouter)

const cartRoutes = require('./routes/cart.routes')
app.use('/cart', cartRoutes)

const newsRoutes = require('./routes/news')
app.use('/api/news', newsRoutes)

const categoriesRoutes = require('./routes/categories')
app.use('/api/categories', categoriesRoutes)

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


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})