require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { readData, writeData } = require('./src/db')

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

// Création automatique du compte admin au démarrage
async function seedAdmin() {
  const users = readData('users')
  if (!users.find(u => u.role === 'admin')) {
    const hashed = await bcrypt.hash('Admin@2026', 10)
    users.push({
      id: uuidv4(),
      name: 'Administrateur',
      email: 'admin@dnzgroup.com',
      phone: '',
      password: hashed,
      role: 'admin'
    })
    writeData('users', users)
    console.log('🔑 Compte admin créé — Email: admin@dnzgroup.com | Mot de passe: Admin@2026')
  }
}

seedAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur DNZ-Group démarré sur http://localhost:${PORT}`)
  })
})
