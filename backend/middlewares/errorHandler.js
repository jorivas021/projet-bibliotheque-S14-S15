// Classe d'erreur applicative avec code HTTP explicite
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Enveloppe une fonction async pour transmettre automatiquement les erreurs à next()
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// Middleware final : capte toutes les erreurs passées via next(err)
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ erreur: err.message });
  }

  // Erreurs PostgreSQL courantes
  if (err.code === '23503') {
    return res.status(400).json({ erreur: 'Référence invalide (clé étrangère inexistante).' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ erreur: 'Cette ressource existe déjà.' });
  }

  res.status(500).json({ erreur: 'Erreur interne du serveur.' });
}

// 404 générique pour les routes inconnues
function notFound(req, res) {
  res.status(404).json({ erreur: 'Route non trouvée.' });
}

module.exports = { ApiError, asyncHandler, errorHandler, notFound };
