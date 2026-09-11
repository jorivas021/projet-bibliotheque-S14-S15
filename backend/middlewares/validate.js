const { ApiError } = require('./errorHandler');

// Middleware générique : vérifie que les champs listés sont présents et non vides dans req.body
function validateBody(champsRequis) {
  return (req, res, next) => {
    const manquants = champsRequis.filter((champ) => {
      const valeur = req.body[champ];
      return valeur === undefined || valeur === null || valeur === '';
    });

    if (manquants.length > 0) {
      return next(new ApiError(400, `Champs manquants ou vides : ${manquants.join(', ')}`));
    }
    next();
  };
}

module.exports = validateBody;
