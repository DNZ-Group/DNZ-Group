const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../db')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

function rowToArticle(row) {
  return {
    id: row.id,
    userId: row.user_id,
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
  }
}

// GET /api/articles
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM articles WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id])
  res.json(rows.map(rowToArticle))
})

// POST /api/articles
router.post('/', async (req, res) => {
  const { type, label, marque, modele, immatriculation, hauteur, longueur, largeur, poids, contenu, description } = req.body

  if (!type || !['voiture', 'carton'].includes(type)) {
    return res.status(400).json({ message: 'Type invalide. Valeurs acceptées : voiture, carton.' })
  }
  if (type === 'voiture' && (!marque || !modele || !immatriculation)) {
    return res.status(400).json({ message: 'Marque, modèle et immatriculation sont requis pour une voiture.' })
  }
  if (type === 'carton' && (!hauteur || !longueur || !largeur)) {
    return res.status(400).json({ message: 'Les dimensions sont requises pour un carton.' })
  }

  const createdAt = new Date().toLocaleDateString('fr-FR')
  const { rows } = await pool.query(
    `INSERT INTO articles (id, user_id, type, label, description, created_at, marque, modele, immatriculation, hauteur, longueur, largeur, poids, contenu)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [uuidv4(), req.user.id, type, label || null, description || '', createdAt,
     marque || null, modele || null, immatriculation || null,
     hauteur || null, longueur || null, largeur || null, poids || null,
     JSON.stringify(contenu || [])]
  )
  res.status(201).json(rowToArticle(rows[0]))
})

// DELETE /api/articles/:id
router.delete('/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM articles WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
  if (rowCount === 0) return res.status(404).json({ message: 'Article non trouvé.' })
  res.json({ message: 'Article supprimé.' })
})

// PUT /api/articles/:id
router.put('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM articles WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
  if (rows.length === 0) return res.status(404).json({ message: 'Article non trouvé.' })

  const current = rows[0]
  const updated = { ...rowToArticle(current), ...req.body, id: current.id, userId: current.user_id }

  await pool.query(
    `UPDATE articles SET type=$1, label=$2, description=$3, marque=$4, modele=$5, immatriculation=$6,
     hauteur=$7, longueur=$8, largeur=$9, poids=$10, contenu=$11 WHERE id=$12`,
    [updated.type, updated.label, updated.description, updated.marque, updated.modele, updated.immatriculation,
     updated.hauteur, updated.longueur, updated.largeur, updated.poids,
     JSON.stringify(updated.contenu || []), current.id]
  )
  res.json(updated)
})

module.exports = router
