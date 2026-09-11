const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/statsController');

router.get('/', ctrl.obtenir);

module.exports = router;
