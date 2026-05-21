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

    // создаем заказ
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

      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        'pending'
      )

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

        total_price
      ]
    )

    const orderId =
      orderResult.rows[0].id

    // сохраняем товары заказа
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
    }

    res.json({

      success: true,

      orderId
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({

      error:
        'Ошибка создания заказа'
    })
  }
}

const getOrderStatus = async (req, res) => {

  try {

    const { id } = req.params

    const result = await pool.query(

      `
      SELECT payment_status
      FROM orders
      WHERE id = $1
      `,

      [id]
    )

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Заказ не найден'
      })
    }

    res.json(result.rows[0])

  } catch (error) {

    console.log(error)

    res.status(500).json({
      error: 'Ошибка сервера'
    })
  }
}

module.exports = {
  createOrder,
  getOrderStatus
}

