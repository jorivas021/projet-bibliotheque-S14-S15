const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/livresController');
const validateBody = require('../middlewares/validate');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.obtenir);
router.post('/', validateBody(['titre', 'auteur_id']), ctrl.creer);
router.put('/:id', validateBody(['titre', 'auteur_id']), ctrl.modifier);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
