import { getDb } from './db.js'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    const db = await getDb()
    const username = 'admin'
    const password = 'password123'
    const displayName = 'Administrator'

    const existing = await db.get('SELECT * FROM users WHERE username = ?', [username])
    if (existing) {
      console.log('Admin user already exists.')
      return
    }

    const hash = await bcrypt.hash(password, 10)
    await db.run(
      'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)',
      [username, hash, displayName]
    )

    console.log('Admin user created successfully!')
    console.log(`Username: ${username}`)
    console.log(`Password: ${password}`)
  } catch (err) {
    console.error('Error seeding database:', err)
  }
}

seed()
