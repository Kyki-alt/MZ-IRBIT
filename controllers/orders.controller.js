const pool = require('../db/db')

const createOrder = async (req, res) => {

  try {

    const {
      customer_name,
      phone,
      email,
      delivery_type,
      payment_type,
      city,
      street,
      house,
      flat,
      total_price,
      items
    } = req.body

    const isCod = payment_type === 'cod'

    // 🔥 1. проверяем stock ДО создания заказа
    for (const item of items) {

      const productResult = await pool.query(
        `
        SELECT stock
        FROM products
        WHERE id = $1
        `,
        [item.id]
      )

      const product = productResult.rows[0]

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          error: `Недостаточно товара (id: ${item.id})`
        })
      }
    }

    // 🔥 2. создаём заказ
    const orderResult = await pool.query(
      `
      INSERT INTO orders (
        customer_name,
        phone,
        email,
        delivery_type,
        payment_type,
        city,
        street,
        house,
        flat,
        total_price,
        payment_status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id
      `,
      [
        customer_name,
        phone,
        email,
        delivery_type,
        payment_type,
        city,
        street,
        house,
        flat,
        total_price,
        isCod ? 'paid' : 'pending'
      ]
    )

    const orderId = orderResult.rows[0].id

    // 🔥 3. сохраняем items + уменьшаем stock
    for (const item of items) {

      await pool.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES ($1,$2,$3,$4)
        `,
        [
          orderId,
          item.id,
          item.quantity,
          item.price
        ]
      )

      await pool.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [
          item.quantity,
          item.id
        ]
      )
    }

    // 🔥 4. ОТВЕТ клиенту (у тебя его не было)
    return res.json({
      success: true,
      orderId
    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({
      error: 'Ошибка создания заказа'
    })
  }
}

module.exports = {
  createOrder
}