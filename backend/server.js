require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')
const { pool, initDB } = require('./src/db')

const authRoutes = require('./src/routes/auth')
const articlesRoutes = require('./src/routes/articles')
const adminRoutes = require('./src/routes/admin')
const emailRoutes = require('./src/routes/email')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/articles', articlesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/email', emailRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DNZ-Group API is running' })
})

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée.' })
})

// Migration des données JSON existantes vers PostgreSQL
async function migrateFromJSON() {
  const usersFile = path.join(__dirname, 'src/data/users.json')
  if (fs.existsSync(usersFile)) {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
    for (const u of users) {
      try {
        await pool.query(
          'INSERT INTO users (id, name, email, phone, password, role) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING',
          [u.id, u.name, u.email, u.phone || '', u.password, u.role || 'user']
        )
      } catch (e) { /* ignore */ }
    }
    console.log('✅ Migration users.json → PostgreSQL terminée')
  }

  const articlesFile = path.join(__dirname, 'src/data/articles.json')
  if (fs.existsSync(articlesFile)) {
    const articles = JSON.parse(fs.readFileSync(articlesFile, 'utf-8'))
    for (const a of articles) {
      try {
        await pool.query(
          `INSERT INTO articles (id, user_id, type, label, description, created_at, marque, modele, immatriculation, hauteur, longueur, largeur, poids, contenu)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (id) DO NOTHING`,
          [a.id, a.userId, a.type, a.label || null, a.description || '', a.createdAt || null,
           a.marque || null, a.modele || null, a.immatriculation || null,
           a.hauteur || null, a.longueur || null, a.largeur || null, a.poids || null,
           JSON.stringify(a.contenu || [])]
        )
      } catch (e) { /* ignore */ }
    }
    console.log('✅ Migration articles.json → PostgreSQL terminée')
  }
}

// Création automatique du compte admin au démarrage
async function seedAdmin() {
  const { rows } = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
  if (rows.length === 0) {
    const hashed = await bcrypt.hash('Admin@2026', 10)
    await pool.query(
      'INSERT INTO users (id, name, email, phone, password, role) VALUES ($1,$2,$3,$4,$5,$6)',
      [uuidv4(), 'Administrateur', 'admin@dnzgroup.com', '', hashed, 'admin']
    )
    console.log('🔑 Compte admin créé — Email: admin@dnzgroup.com | Mot de passe: Admin@2026')
  }
}

async function start() {
  await initDB()
  await migrateFromJSON()
  await seedAdmin()
  app.listen(PORT, () => {
    console.log(`✅ Serveur DNZ-Group démarré sur http://localhost:${PORT}`)
  })
}

start().catch(err => {
  console.error('❌ Erreur au démarrage:', err)
  process.exit(1)
})
