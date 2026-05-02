const router = require('express').Router();
const ctrl = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');

router.get('/', auth, ctrl.listar);
router.get('/:id', auth, ctrl.buscarPorId);
router.put('/:id', auth, ctrl.atualizar);
router.delete('/:id', auth, ctrl.deletar);

module.exports = router;