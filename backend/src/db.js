const { Pool } = require('pg')

const isInternal = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('.railway.internal')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isInternal ? false : { rejectUnauthorized: false }
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('voiture', 'carton')),
      label TEXT,
      description TEXT DEFAULT '',
      created_at TEXT,
      marque TEXT,
      modele TEXT,
      immatriculation TEXT,
      hauteur TEXT,
      longueur TEXT,
      largeur TEXT,
      poids TEXT,
      contenu JSONB DEFAULT '[]'::jsonb
    )
  `)
}

module.exports = { pool, initDB }
