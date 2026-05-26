const pool = require('../db/db')

const validateCart = async (req, res) => {
  try {
    const { items } = req.body

    const errors = []

    for (const item of items) {
        const result = await pool.query(
            `
            SELECT id, stock
            FROM products
            WHERE id = $1
            `,
            [item.id]
        )

        const product = result.rows[0]

            if (!product) {
            return res.status(400).json({
                ok: false,
                error: `Товар id=${item.id} не найден`
            })
            }

            if (product.stock < item.quantity) {
            return res.status(400).json({
                ok: false,
                error: `Недостаточно товара id=${item.id}. Осталось: ${product.stock}`
            })
        }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        ok: false,
        errors
      })
    }

    return res.json({
      ok: true
    })

  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Ошибка проверки корзины'
    })
  }
}

module.exports = {
  validateCart
}