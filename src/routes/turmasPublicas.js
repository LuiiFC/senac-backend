const router = require('express').Router();
const ctrl = require('../controllers/turmaController');

router.get('/', ctrl.listarPublicas);

module.exports = router;