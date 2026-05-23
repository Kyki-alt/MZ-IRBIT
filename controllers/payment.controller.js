const crypto = require('crypto')

const pool = require('../db/db')

export const webmoneyResult = async (req, res) => {
  try {
    console.log('WEBMONEY BODY:', req.body)

    const orderId =
      Number(req.body.LMI_PAYMENT_NO)

    await pool.query(
      `
      UPDATE orders
      SET status = 'paid'
      WHERE id = $1
      `,
      [orderId]
    )

    return res.send('YES')
  } catch (error) {
    console.log(error)
    return res.status(500).send('ERROR')
  }
}

module.exports = {
  webmoneyResult
}