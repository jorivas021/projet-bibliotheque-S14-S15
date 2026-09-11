const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/empruntsController');
const validateBody = require('../middlewares/validate');

router.get('/', ctrl.listerEnCours);
router.get('/retard', ctrl.listerEnRetard);
router.post('/', validateBody(['adherent_id', 'livre_id', 'date_retour_prevue']), ctrl.creer);
router.patch('/:id/retour', ctrl.enregistrerRetour);

module.exports = router;
