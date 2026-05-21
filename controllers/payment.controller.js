const crypto = require('crypto')

const pool = require('../db/db')

const webmoneyResult = async (req, res) => {

  try {

    console.log('WEBMONEY BODY:', req.body)

    const orderId =
      Number(req.body.LMI_PAYMENT_NO)

    console.log('ORDER ID:', orderId)

    const result = await pool.query(

      `
      UPDATE orders
      SET payment_status = 'paid'
      WHERE id = $1
      RETURNING *
      `,

      [orderId]
    )

    console.log(
      'UPDATED ROWS:',
      result.rowCount
    )

    console.log(
      'UPDATED ORDER:',
      result.rows
    )

    res.send('YES')

  } catch (error) {

    console.log(error)

    res.status(500).send('ERROR')
  }
}

module.exports = {
  webmoneyResult
}