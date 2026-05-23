const crypto = require('crypto')
const pool = require('../db/db')

const webmoneyResult = async (req, res) => {

  console.log('BODY:', req.body)

  try {

        // FAIL REQUEST
    if (req.body.LMI_FAILREQUEST === '1') {

      console.log('FAIL PAYMENT')

      await pool.query(
        `
        UPDATE orders
        SET payment_status = 'failed'
        WHERE id = $1
        `,
        [req.body.LMI_PAYMENT_NO]
      )

      return res.send('YES')
    }

    // защита от пустого body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.send('YES')
    }

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

    console.log('HASH FROM WM:', LMI_HASH)

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

    console.log('MY HASH:', checkHash)

    if (checkHash !== LMI_HASH) {
      console.log('INVALID HASH')
      return res.status(400).send('Invalid hash')
    }

    // успешная оплата
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

// FAIL URL
const paymentFail = async (req, res) => {

  try {

    const orderId = req.query.LMI_PAYMENT_NO

    await pool.query(
      `
      UPDATE orders
      SET payment_status = 'failed'
      WHERE id = $1
      `,
      [orderId]
    )

    res.redirect(
      `https://mz-irbit-web.onrender.com/#/payment-result?status=failed&orderId=${orderId}`
    )

  } catch (error) {

    console.log(error)

    res.status(500).send('ERROR')
  }
}

// SUCCESS URL
const paymentSuccess = (req, res) => {

   const orderId = req.query.LMI_PAYMENT_NO

  res.redirect(
    `https://mz-irbit-web.onrender.com/#/payment-result?status=success&orderId=${orderId}`
  )
}

module.exports = {
  webmoneyResult,
  paymentSuccess,
  paymentFail
}