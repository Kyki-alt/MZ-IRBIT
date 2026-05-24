const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/login', async (req, res) => {

  try {

    const { login, password } = req.body

    if (
      login !== process.env.ADMIN_LOGIN ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: 'Неверный логин или пароль'
      })
    }

    const token = jwt.sign(

      {
        role: 'admin'
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '7d'
      }
    )

    res.json({
      token
    })

  } catch (err) {

    res.status(500).json({
      message: 'Ошибка сервера'
    })

  }
})

module.exports = router