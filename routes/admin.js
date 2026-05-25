const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const pool = require('../db/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    // 1. ищем админа в БД
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE login = $1',
      [login]
    );

    const admin = adminResult.rows[0];

        if (!admin) {
        return res.status(401).json({ message: 'Неверный логин' });
        }

        if (!admin.password) {
        return res.status(500).json({ message: 'Пароль не найден' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    // 3. создаём JWT
    const token = jwt.sign(
      {
        id: admin.id,
        login: admin.login,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({ token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.get('/check', async (req, res) => {

  try {

    const authHeader =
      req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message: 'Нет токена'
      })
    }

    const token =
      authHeader.split(' ')[1]

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Нет доступа'
      })
    }

    return res.json({
      ok: true,
      admin: decoded
    })

  } catch (err) {

    return res.status(401).json({
      message: 'Невалидный токен'
    })

  }
})

module.exports = router;