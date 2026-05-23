const crypto = require('crypto')
const pool = require('../db/db')

const webmoneyResult = async (req, res) => {

  console.log('CONTENT-TYPE:', req.headers['content-type'])
  console.log('BODY:', req.body)

  // защита от пустого body
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.send('YES')
  }

  try {

    const {
      LMI_PAYMENT_NO,
      LMI_PAYEE_PURSE,
      LMI_PAYMENT_AMOUNT,
      LMI_MODE,
      LMI_SYS_INVS_NO,
      LMI_SYS_TRANS_NO,
      LMI_SYS_TRANS_DATE,
      LMI_PAYER_PURSE,
      LMI_PAYER_WM,
      LMI_HASH,
      LMI_PREREQUEST
    } = req.body

    // pre-request от WebMoney
    if (LMI_PREREQUEST === '1') {
      return res.send('YES')
    }

    const hashString =
      `${LMI_PAYEE_PURSE}` +
      `${LMI_PAYMENT_AMOUNT}` +
      `${LMI_PAYMENT_NO}` +
      `${LMI_MODE}` +
      `${LMI_SYS_INVS_NO}` +
      `${LMI_SYS_TRANS_NO}` +
      `${LMI_SYS_TRANS_DATE}` +
      `${process.env.WM_SECRET_KEY}` +
      `${LMI_PAYER_PURSE}` +
      `${LMI_PAYER_WM}`

    const checkHash = crypto
      .createHash('sha256')
      .update(hashString)
      .digest('hex')
      .toUpperCase()

    console.log('HASH FROM WM:', LMI_HASH)
    console.log('MY HASH:', checkHash)

    if (checkHash !== LMI_HASH) {
      console.log('INVALID HASH')
      return res.status(400).send('Invalid hash')
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET payment_status = 'paid'
      WHERE id = $1
      `,
      [LMI_PAYMENT_NO]
    )

    console.log('UPDATED:', result.rowCount)

    res.send('YES')

  } catch (error) {

    console.log(error)

    res.status(500).send('ERROR')
  }
}

module.exports = {
  webmoneyResult
}