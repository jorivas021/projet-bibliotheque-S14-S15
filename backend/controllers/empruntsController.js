const pool = require('../config/db');
const { asyncHandler, ApiError } = require('../middlewares/errorHandler');

const SELECT_BASE = `
  SELECT e.id, e.date_emprunt, e.date_retour_prevue, e.date_retour_effective,
         l.id AS livre_id, l.titre AS livre_titre,
         ad.id AS adherent_id, ad.nom AS adherent_nom
  FROM emprunts e
  JOIN livres l ON l.id = e.livre_id
  JOIN adherents ad ON ad.id = e.adherent_id
`;

// GET /api/emprunts -> tous les emprunts en cours
const listerEnCours = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `${SELECT_BASE} WHERE e.date_retour_effective IS NULL ORDER BY e.date_retour_prevue`
  );
  res.json(result.rows);
});

// GET /api/emprunts/retard -> emprunts en cours dont la date prévue est dépassée
const listerEnRetard = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `${SELECT_BASE}
     WHERE e.date_retour_effective IS NULL AND e.date_retour_prevue < CURRENT_DATE
     ORDER BY e.date_retour_prevue`
  );
  res.json(result.rows);
});

// POST /api/emprunts -> créer un emprunt (refuse si le livre est déjà emprunté)
const creer = asyncHandler(async (req, res) => {
  const { adherent_id, livre_id, date_retour_prevue } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const livre = await client.query('SELECT disponible FROM livres WHERE id = $1 FOR UPDATE', [livre_id]);
    if (livre.rows.length === 0) {
      throw new ApiError(404, 'Livre non trouvé.');
    }
    if (!livre.rows[0].disponible) {
      throw new ApiError(409, 'Ce livre est déjà emprunté.');
    }

    const adherent = await client.query('SELECT id FROM adherents WHERE id = $1', [adherent_id]);
    if (adherent.rows.length === 0) {
      throw new ApiError(404, 'Adhérent non trouvé.');
    }

    const emprunt = await client.query(
      `INSERT INTO emprunts (adherent_id, livre_id, date_retour_prevue)
       VALUES ($1, $2, $3) RETURNING *`,
      [adherent_id, livre_id, date_retour_prevue]
    );

    await client.query('UPDATE livres SET disponible = FALSE WHERE id = $1', [livre_id]);

    // Si l'adhérent avait réservé ce livre, la réservation est honorée : on la retire de la file d'attente.
    await client.query(
      'DELETE FROM reservations WHERE livre_id = $1 AND adherent_id = $2',
      [livre_id, adherent_id]
    );

    await client.query('COMMIT');
    res.status(201).json(emprunt.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// PATCH /api/emprunts/:id/retour -> enregistrer le retour d'un livre
const enregistrerRetour = asyncHandler(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const emprunt = await client.query('SELECT * FROM emprunts WHERE id = $1 FOR UPDATE', [req.params.id]);
    if (emprunt.rows.length === 0) {
      throw new ApiError(404, 'Emprunt non trouvé.');
    }
    if (emprunt.rows[0].date_retour_effective) {
      throw new ApiError(409, 'Ce livre a déjà été retourné.');
    }

    const misAJour = await client.query(
      'UPDATE emprunts SET date_retour_effective = CURRENT_DATE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    await client.query('UPDATE livres SET disponible = TRUE WHERE id = $1', [emprunt.rows[0].livre_id]);

    await client.query('COMMIT');
    res.json(misAJour.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

module.exports = { listerEnCours, listerEnRetard, creer, enregistrerRetour };
