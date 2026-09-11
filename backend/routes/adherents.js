const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adherentsController');
const validateBody = require('../middlewares/validate');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.obtenir);
router.get('/:id/emprunts', ctrl.historique);
router.post('/', validateBody(['nom', 'contact']), ctrl.creer);
router.put('/:id', validateBody(['nom', 'contact']), ctrl.modifier);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
