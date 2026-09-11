const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auteursController');
const validateBody = require('../middlewares/validate');

router.get('/', ctrl.lister);
router.get('/:id', ctrl.obtenir);
router.post('/', validateBody(['nom']), ctrl.creer);
router.put('/:id', validateBody(['nom']), ctrl.modifier);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
