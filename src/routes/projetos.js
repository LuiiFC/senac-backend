const router = require('express').Router();
const ctrl = require('../controllers/projetoController');
const auth = require('../middlewares/auth');
const { apenas } = require('../middlewares/auth');

router.get('/', auth, ctrl.listar);
router.post('/', auth, apenas('professor', 'coordenador'), ctrl.criar);
router.post('/aluno', auth, apenas('aluno'), ctrl.enviarAluno);
router.get('/:id', auth, ctrl.buscarPorId);

module.exports = router;