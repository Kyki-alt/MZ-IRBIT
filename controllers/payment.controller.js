const crypto = require('crypto')

const pool = require('../db/db')

const webmoneyResult = async (req, res) => {

  try {

    const body = req.body || {}

    if (Object.keys(body).length === 0) {

      return res.status(200).send('YES')
    }

    console.log(
      'WEBMONEY BODY:',
      body
    )

    const {

      LMI_PAYEE_PURSE,
      LMI_PAYMENT_AMOUNT,
      LMI_PAYMENT_NO,
      LMI_MODE,
      LMI_SYS_INVS_NO,
      LMI_SYS_TRANS_NO,
      LMI_SYS_TRANS_DATE,
      LMI_PAYER_PURSE,
      LMI_PAYER_WM,
      LMI_HASH

    } = body

    const secretKey =
      process.env.WM_SECRET

    const hashString =

      `${LMI_PAYEE_PURSE}` +
      `${LMI_PAYMENT_AMOUNT}` +
      `${LMI_PAYMENT_NO}` +
      `${LMI_MODE}` +
      `${LMI_SYS_INVS_NO}` +
      `${LMI_SYS_TRANS_NO}` +
      `${LMI_SYS_TRANS_DATE}` +
      `${secretKey}` +
      `${LMI_PAYER_PURSE}` +
      `${LMI_PAYER_WM}`

    const checkHash = crypto
      .createHash('md5')
      .update(hashString)
      .digest('hex')
      .toUpperCase()

    if (checkHash !== LMI_HASH) {

      return res
        .status(400)
        .send('INVALID HASH')
    }

    await pool.query(

      `
      UPDATE orders
      SET payment_status = 'paid'
      WHERE id = $1
      `,

      [LMI_PAYMENT_NO]
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