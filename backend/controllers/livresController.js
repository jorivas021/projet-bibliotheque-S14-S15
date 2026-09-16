const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

// GET /api/livres?q=texte&page=1&limite=10&disponible=true&auteur_id=3
// Recherche par titre ou nom d'auteur, filtres disponibilité/auteur, avec pagination
const lister = asyncHandler(async (req, res) => {
  const { q, disponible, auteur_id } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 10, 1), 100);
  const offset = (page - 1) * limite;

  const conditions = [];
  const valeurs = [];

  if (q) {
    valeurs.push(`%${q}%`);
    conditions.push(`(l.titre ILIKE $${valeurs.length} OR a.nom ILIKE $${valeurs.length})`);
  }
  if (disponible === 'true' || disponible === 'false') {
    valeurs.push(disponible === 'true');
    conditions.push(`l.disponible = $${valeurs.length}`);
  }
  if (auteur_id) {
    valeurs.push(auteur_id);
    conditions.push(`l.auteur_id = $${valeurs.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalResult = await pool.query(
    `SELECT COUNT(*) FROM livres l JOIN auteurs a ON a.id = l.auteur_id ${whereClause}`,
    valeurs
  );

  valeurs.push(limite, offset);
  const result = await pool.query(
    `SELECT l.id, l.titre, l.annee_publication, l.disponible,
            a.id AS auteur_id, a.nom AS auteur_nom
     FROM livres l
     JOIN auteurs a ON a.id = l.auteur_id
     ${whereClause}
     ORDER BY l.titre
     LIMIT $${valeurs.length - 1} OFFSET $${valeurs.length}`,
    valeurs
  );

  res.json({
    donnees: result.rows,
    pagination: {
      page,
      limite,
      total: parseInt(totalResult.rows[0].count, 10),
      totalPages: Math.ceil(parseInt(totalResult.rows[0].count, 10) / limite),
    },
  });
});

const obtenir = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT l.*, a.nom AS auteur_nom
     FROM livres l JOIN auteurs a ON a.id = l.auteur_id
     WHERE l.id = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Livre non trouvé.');
  res.json(result.rows[0]);
});

const creer = asyncHandler(async (req, res) => {
  const { titre, annee_publication, auteur_id } = req.body;
  const result = await pool.query(
    'INSERT INTO livres (titre, annee_publication, auteur_id) VALUES ($1, $2, $3) RETURNING *',
    [titre, annee_publication || null, auteur_id]
  );
  res.status(201).json(result.rows[0]);
});

const modifier = asyncHandler(async (req, res) => {
  const { titre, annee_publication, auteur_id } = req.body;
  const result = await pool.query(
    `UPDATE livres SET titre = $1, annee_publication = $2, auteur_id = $3
     WHERE id = $4 RETURNING *`,
    [titre, annee_publication || null, auteur_id, req.params.id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Livre non trouvé.');
  res.json(result.rows[0]);
});

const supprimer = asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM livres WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Livre non trouvé.');
  res.status(204).send();
});

module.exports = { lister, obtenir, creer, modifier, supprimer };
