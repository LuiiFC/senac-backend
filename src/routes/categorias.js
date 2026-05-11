const router = require('express').Router();
const ctrl = require('../controllers/categoriaController');
const auth = require('../middlewares/auth');
const { apenas } = require('../middlewares/auth');

router.get('/', auth, ctrl.listar);
router.post('/', auth, apenas('coordenador'), ctrl.criar);
router.delete('/:id', auth, apenas('coordenador'), ctrl.deletar);

module.exports = router;