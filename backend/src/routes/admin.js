const express = require('express')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../db')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()
router.use(adminMiddleware)

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [usersRes, articlesRes] = await Promise.all([
    pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
    pool.query('SELECT type, COUNT(*) as count FROM articles GROUP BY type')
  ])
  const userCounts = Object.fromEntries(usersRes.rows.map(r => [r.role, parseInt(r.count)]))
  const articleCounts = Object.fromEntries(articlesRes.rows.map(r => [r.type, parseInt(r.count)]))
  const totalArticles = articlesRes.rows.reduce((s, r) => s + parseInt(r.count), 0)
  res.json({
    totalUsers: userCounts['user'] || 0,
    totalAdmins: userCounts['admin'] || 0,
    totalArticles,
    voitures: articleCounts['voiture'] || 0,
    cartons: articleCounts['carton'] || 0
  })
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC')
  res.json(rows)
})

// POST /api/admin/users
router.post('/users', async (req, res) => {
  const { name, email, phone, password, role } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, e-mail et mot de passe requis.' })
  }
  try {
    const hashed = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (id, name, email, phone, password, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, phone, role',
      [uuidv4(), name, email, phone || '', hashed, role === 'admin' ? 'admin' : 'user']
    )
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Cet e-mail est déjà utilisé.' })
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id])
  if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé.' })
  if (rows[0].role === 'admin') return res.status(403).json({ message: 'Impossible de supprimer un compte administrateur.' })
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
  res.json({ message: 'Utilisateur supprimé.' })
})

// GET /api/admin/articles
router.get('/articles', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.*, u.name as "userName" FROM articles a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC`
  )
  res.json(rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    userName: row.userName || 'Inconnu',
    type: row.type,
    label: row.label,
    description: row.description,
    createdAt: row.created_at,
    marque: row.marque,
    modele: row.modele,
    immatriculation: row.immatriculation,
    hauteur: row.hauteur,
    longueur: row.longueur,
    largeur: row.largeur,
    poids: row.poids,
    contenu: row.contenu || []
  })))
})

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ message: 'Article non trouvé.' })
  res.json({ message: 'Article supprimé.' })
})

module.exports = router
