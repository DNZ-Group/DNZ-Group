const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { readData, writeData } = require('../db')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// Toutes les routes nécessitent une authentification
router.use(authMiddleware)

// GET /api/articles — récupérer les articles de l'utilisateur connecté
router.get('/', (req, res) => {
  const all = readData('articles')
  const userArticles = all.filter(a => a.userId === req.user.id)
  res.json(userArticles)
})

// POST /api/articles — créer un article
router.post('/', (req, res) => {
  const { type, label, marque, modele, immatriculation, hauteur, longueur, largeur, poids, contenu, description } = req.body

  if (!type || !['voiture', 'carton'].includes(type)) {
    return res.status(400).json({ message: 'Type invalide. Valeurs acceptées : voiture, carton.' })
  }

  const article = {
    id: uuidv4(),
    userId: req.user.id,
    type,
    label,
    description: description || '',
    createdAt: new Date().toLocaleDateString('fr-FR')
  }

  if (type === 'voiture') {
    if (!marque || !modele || !immatriculation) {
      return res.status(400).json({ message: 'Marque, modèle et immatriculation sont requis pour une voiture.' })
    }
    article.marque = marque
    article.modele = modele
    article.immatriculation = immatriculation
  } else {
    if (!hauteur || !longueur || !largeur) {
      return res.status(400).json({ message: 'Les dimensions sont requises pour un carton.' })
    }
    article.hauteur = hauteur
    article.longueur = longueur
    article.largeur = largeur
    article.poids = poids || null
    article.contenu = contenu || []
  }

  const all = readData('articles')
  all.push(article)
  writeData('articles', all)

  res.status(201).json(article)
})

// DELETE /api/articles/:id — supprimer un article
router.delete('/:id', (req, res) => {
  const all = readData('articles')
  const index = all.findIndex(a => a.id === req.params.id && a.userId === req.user.id)

  if (index === -1) {
    return res.status(404).json({ message: 'Article non trouvé.' })
  }

  all.splice(index, 1)
  writeData('articles', all)
  res.json({ message: 'Article supprimé.' })
})

// PUT /api/articles/:id — modifier un article
router.put('/:id', (req, res) => {
  const all = readData('articles')
  const index = all.findIndex(a => a.id === req.params.id && a.userId === req.user.id)

  if (index === -1) {
    return res.status(404).json({ message: 'Article non trouvé.' })
  }

  all[index] = { ...all[index], ...req.body, id: all[index].id, userId: all[index].userId }
  writeData('articles', all)
  res.json(all[index])
})

module.exports = router
