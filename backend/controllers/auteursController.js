const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

const lister = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM auteurs ORDER BY nom');
  res.json(result.rows);
});

const obtenir = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM auteurs WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Auteur non trouvé.');
  res.json(result.rows[0]);
});

const creer = asyncHandler(async (req, res) => {
  const { nom, nationalite } = req.body;
  const result = await pool.query(
    'INSERT INTO auteurs (nom, nationalite) VALUES ($1, $2) RETURNING *',
    [nom, nationalite || null]
  );
  res.status(201).json(result.rows[0]);
});

const modifier = asyncHandler(async (req, res) => {
  const { nom, nationalite } = req.body;
  const result = await pool.query(
    'UPDATE auteurs SET nom = $1, nationalite = $2 WHERE id = $3 RETURNING *',
    [nom, nationalite || null, req.params.id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Auteur non trouvé.');
  res.json(result.rows[0]);
});

const supprimer = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM auteurs WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Auteur non trouvé.');
  res.status(204).send();
});

module.exports = { lister, obtenir, creer, modifier, supprimer };
