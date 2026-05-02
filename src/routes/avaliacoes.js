const router = require('express').Router();
const ctrl = require('../controllers/avaliacaoController');
const auth = require('../middlewares/auth');

router.get('/:projeto_id', auth, ctrl.listarPorProjeto);
router.post('/:projeto_id', auth, ctrl.criar);

module.exports = router;