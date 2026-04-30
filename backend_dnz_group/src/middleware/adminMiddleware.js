const authMiddleware = require('./auth')

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' })
    }
    next()
  })
}

module.exports = adminMiddleware
