require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('./db/db');

async function createAdmin() {
  try {

    const login = 'admin';
    const password = '12345';

    // хешируем пароль
    const hash = await bcrypt.hash(password, 10);

    // добавляем админа
    await pool.query(
      'INSERT INTO admins (login, password) VALUES ($1, $2)',
      [login, hash]
    );

    console.log('✅ Админ создан');

  } catch (err) {

  console.error(err);

} finally {

    process.exit();

  }
}

createAdmin();