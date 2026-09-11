const pool = require('../config/db');
const { asyncHandler } = require('../middlewares/errorHandler');

const obtenir = asyncHandler(async (req, res) => {
  const [totaux, livrePlusEmprunte, adherentLePlusActif] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM livres) AS total_livres,
        (SELECT COUNT(*) FROM adherents) AS total_adherents,
        (SELECT COUNT(*) FROM emprunts WHERE date_retour_effective IS NULL) AS emprunts_en_cours,
        (SELECT COUNT(*) FROM emprunts
          WHERE date_retour_effective IS NULL AND date_retour_prevue < CURRENT_DATE) AS emprunts_en_retard
    `),
    pool.query(`
      SELECT l.id, l.titre, COUNT(e.id) AS nombre_emprunts
      FROM emprunts e JOIN livres l ON l.id = e.livre_id
      GROUP BY l.id, l.titre
      ORDER BY nombre_emprunts DESC
      LIMIT 1
    `),
    pool.query(`
      SELECT a.id, a.nom, COUNT(e.id) AS nombre_emprunts
      FROM emprunts e JOIN adherents a ON a.id = e.adherent_id
      GROUP BY a.id, a.nom
      ORDER BY nombre_emprunts DESC
      LIMIT 1
    `),
  ]);

  res.json({
    ...totaux.rows[0],
    livre_plus_emprunte: livrePlusEmprunte.rows[0] || null,
    adherent_plus_actif: adherentLePlusActif.rows[0] || null,
  });
});

module.exports = { obtenir };
