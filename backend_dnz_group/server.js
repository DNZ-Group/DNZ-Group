require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./src/routes/auth')
const articlesRoutes = require('./src/routes/articles')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/articles', articlesRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DNZ-Group API is running' })
})

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée.' })
})

app.listen(PORT, () => {
  console.log(`✅ Serveur DNZ-Group démarré sur http://localhost:${PORT}`)
})
