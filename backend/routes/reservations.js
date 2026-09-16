const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservationsController');
const validateBody = require('../middlewares/validate');

router.get('/', ctrl.lister);
router.post('/', validateBody(['livre_id', 'adherent_id']), ctrl.creer);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
