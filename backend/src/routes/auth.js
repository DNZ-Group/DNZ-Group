const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../db')

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, e-mail et mot de passe sont requis.' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (id, name, email, phone, password, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, phone, role',
      [uuidv4(), name, email, phone || '', hashedPassword, 'user']
    )
    const user = rows[0]
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user, token })
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ message: 'Un compte avec cet e-mail existe déjà.' })
    }
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail et mot de passe sont requis.' })
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]
    if (!user) return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' })

    const { password: _, ...safeUser } = user
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: safeUser, token })
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
