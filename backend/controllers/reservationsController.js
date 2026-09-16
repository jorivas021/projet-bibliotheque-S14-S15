const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

// GET /api/reservations?livre_id=X
// Sans livre_id : liste toutes les réservations. Avec livre_id : la file d'attente pour ce livre, dans l'ordre.
const lister = asyncHandler(async (req, res) => {
  const { livre_id } = req.query;
  const conditions = [];
  const valeurs = [];

  if (livre_id) {
    valeurs.push(livre_id);
    conditions.push(`r.livre_id = $${valeurs.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT r.id, r.date_reservation,
            l.id AS livre_id, l.titre AS livre_titre,
            ad.id AS adherent_id, ad.nom AS adherent_nom
     FROM reservations r
     JOIN livres l ON l.id = r.livre_id
     JOIN adherents ad ON ad.id = r.adherent_id
     ${whereClause}
     ORDER BY r.date_reservation ASC`,
    valeurs
  );
  res.json(result.rows);
});

// POST /api/reservations { livre_id, adherent_id }
// Une réservation n'a de sens que si le livre est déjà emprunté (indisponible).
const creer = asyncHandler(async (req, res) => {
  const { livre_id, adherent_id } = req.body;

  const livre = await pool.query('SELECT disponible FROM livres WHERE id = $1', [livre_id]);
  if (livre.rows.length === 0) throw new ApiError(404, 'Livre non trouvé.');
  if (livre.rows[0].disponible) {
    throw new ApiError(400, 'Ce livre est disponible, inutile de le réserver : il peut être emprunté directement.');
  }

  const dejaReserve = await pool.query(
    'SELECT id FROM reservations WHERE livre_id = $1 AND adherent_id = $2',
    [livre_id, adherent_id]
  );
  if (dejaReserve.rows.length > 0) {
    throw new ApiError(409, 'Cet adhérent a déjà réservé ce livre.');
  }

  const result = await pool.query(
    'INSERT INTO reservations (livre_id, adherent_id) VALUES ($1, $2) RETURNING *',
    [livre_id, adherent_id]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /api/reservations/:id
const supprimer = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM reservations WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Réservation non trouvée.');
  res.status(204).send();
});

module.exports = { lister, creer, supprimer };
