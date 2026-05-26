const pool = require('../db/db')

const validateCart = async (req, res) => {
  try {
    const { items } = req.body

    const resultItems = []

    for (const item of items) {
      const productResult = await pool.query(
        `SELECT id, stock FROM products WHERE id = $1`,
        [item.id]
      )

      const product = productResult.rows[0]

      if (!product) {
        resultItems.push({
          id: item.id,
          status: 'missing',
          message: 'Товар не найден',
          available: 0
        })
        continue
      }

      if (product.stock <= 0) {
        resultItems.push({
          id: item.id,
          status: 'out_of_stock',
          message: 'Нет в наличии',
          available: 0
        })
        continue
      }

      if (product.stock < item.quantity) {
        resultItems.push({
          id: item.id,
          status: 'partial',
          message: `Доступно только ${product.stock}`,
          available: product.stock
        })
        continue
      }

      resultItems.push({
        id: item.id,
        status: 'ok',
        available: item.quantity
      })
    }

    return res.json({
      ok: true,
      items: resultItems
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