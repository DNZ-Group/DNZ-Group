const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { readData, writeData } = require('../db')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()
router.use(adminMiddleware)

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const users = readData('users')
  const articles = readData('articles')
  res.json({
    totalUsers: users.filter(u => u.role !== 'admin').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    totalArticles: articles.length,
    voitures: articles.filter(a => a.type === 'voiture').length,
    cartons: articles.filter(a => a.type === 'carton').length
  })
})

// GET /api/admin/users
router.get('/users', (req, res) => {
  const users = readData('users')
  const safeUsers = users.map(({ password, ...u }) => u)
  res.json(safeUsers)
})

// POST /api/admin/users — créer un utilisateur ou un admin
router.post('/users', async (req, res) => {
  const { name, email, phone, password, role } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, e-mail et mot de passe requis.' })
  }
  const users = readData('users')
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Cet e-mail est déjà utilisé.' })
  }
  const hashed = await bcrypt.hash(password, 10)
  const newUser = {
    id: uuidv4(),
    name,
    email,
    phone: phone || '',
    password: hashed,
    role: role === 'admin' ? 'admin' : 'user'
  }
  users.push(newUser)
  writeData('users', users)
  const { password: _, ...safeUser } = newUser
  res.status(201).json(safeUser)
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  const users = readData('users')
  const index = users.findIndex(u => u.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Utilisateur non trouvé.' })
  if (users[index].role === 'admin') {
    return res.status(403).json({ message: 'Impossible de supprimer un compte administrateur.' })
  }
  users.splice(index, 1)
  writeData('users', users)
  res.json({ message: 'Utilisateur supprimé.' })
})

// GET /api/admin/articles — tous les articles avec le nom de l'utilisateur
router.get('/articles', (req, res) => {
  const articles = readData('articles')
  const users = readData('users')
  const enriched = articles.map(a => {
    const user = users.find(u => u.id === a.userId)
    return { ...a, userName: user ? user.name : 'Inconnu' }
  })
  res.json(enriched)
})

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', (req, res) => {
  const articles = readData('articles')
  const index = articles.findIndex(a => a.id === req.params.id)
  if (index === -1) return res.status(404).json({ message: 'Article non trouvé.' })
  articles.splice(index, 1)
  writeData('articles', articles)
  res.json({ message: 'Article supprimé.' })
})

module.exports = router
