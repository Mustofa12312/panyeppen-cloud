import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data')
fs.ensureDirSync(DATA_DIR)

const DB_PATH = path.join(DATA_DIR, 'database.sqlite')

let dbInstance = null

export async function getDb() {
  if (dbInstance) return dbInstance

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  })

  // Optimize SQLite
  await dbInstance.exec('PRAGMA journal_mode=WAL;')

  // Initialize tables
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY, -- Share token (UUID)
      user_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trash_items (
      id TEXT PRIMARY KEY, -- UUID
      user_id INTEGER NOT NULL,
      original_path TEXT NOT NULL,
      trash_filename TEXT NOT NULL,
      deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  // Migrations (Add new columns if not exist)
  try {
    await dbInstance.exec(`ALTER TABLE shares ADD COLUMN expires_at DATETIME;`)
  } catch (err) {
    // Column might already exist
  }
  try {
    await dbInstance.exec(`ALTER TABLE shares ADD COLUMN password_hash TEXT;`)
  } catch (err) {
    // Column might already exist
  }

  return dbInstance
}
