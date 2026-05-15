const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { readData, writeData } = require('../db')

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, e-mail et mot de passe sont requis.' })
  }

  const users = readData('users')
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Un compte avec cet e-mail existe déjà.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = { id: uuidv4(), name, email, phone: phone || '', password: hashedPassword, role: 'user' }
  users.push(user)
  writeData('users', users)

  const { password: _, ...safeUser } = user
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

  res.status(201).json({ user: safeUser, token })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail et mot de passe sont requis.' })
  }

  const users = readData('users')
  const user = users.find(u => u.email === email)
  if (!user) {
    return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' })
  }

  const { password: _, ...safeUser } = user
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })

  res.json({ user: safeUser, token })
})

module.exports = router
