const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db/db')

const router = express.Router()

// middleware защиты
function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Нет токена' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Невалидный токен' })
  }
}

router.post('/create', auth, async (req, res) => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      return res.status(400).json({
        message: 'Заполните все поля'
      })
    }

    const exists = await pool.query(
      'SELECT id FROM admins WHERE login = $1',
      [login]
    )

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: 'Такой админ уже есть'
      })
    }

    const hash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO admins (login, password)
       VALUES ($1, $2)
       RETURNING id, login, created_at`,
      [login, hash]
    )

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

router.get('/list', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, login, created_at FROM admins ORDER BY id DESC'
    )

    res.json(result.rows)

  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

module.exports = router