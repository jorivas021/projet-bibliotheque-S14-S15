const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

const lister = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM adherents ORDER BY nom');
  res.json(result.rows);
});

const obtenir = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM adherents WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Adhérent non trouvé.');
  res.json(result.rows[0]);
});

const creer = asyncHandler(async (req, res) => {
  const { nom, contact } = req.body;
  const result = await pool.query(
    'INSERT INTO adherents (nom, contact) VALUES ($1, $2) RETURNING *',
    [nom, contact]
  );
  res.status(201).json(result.rows[0]);
});

const modifier = asyncHandler(async (req, res) => {
  const { nom, contact } = req.body;
  const result = await pool.query(
    'UPDATE adherents SET nom = $1, contact = $2 WHERE id = $3 RETURNING *',
    [nom, contact, req.params.id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Adhérent non trouvé.');
  res.json(result.rows[0]);
});

const supprimer = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM adherents WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Adhérent non trouvé.');
  res.status(204).send();
});

// Historique des emprunts (en cours et passés) d'un adhérent donné
const historique = asyncHandler(async (req, res) => {
  const adherent = await pool.query('SELECT id FROM adherents WHERE id = $1', [req.params.id]);
  if (adherent.rows.length === 0) throw new ApiError(404, 'Adhérent non trouvé.');

  const result = await pool.query(
    `SELECT e.id, e.date_emprunt, e.date_retour_prevue, e.date_retour_effective,
            l.id AS livre_id, l.titre AS livre_titre,
            (e.date_retour_effective IS NULL) AS en_cours,
            (e.date_retour_effective IS NULL AND e.date_retour_prevue < CURRENT_DATE) AS en_retard
     FROM emprunts e
     JOIN livres l ON l.id = e.livre_id
     WHERE e.adherent_id = $1
     ORDER BY e.date_emprunt DESC`,
    [req.params.id]
  );
  res.json(result.rows);
});

module.exports = { lister, obtenir, creer, modifier, supprimer, historique };
