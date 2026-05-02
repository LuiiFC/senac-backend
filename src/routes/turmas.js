const router = require('express').Router();
const ctrl = require('../controllers/turmaController');
const auth = require('../middlewares/auth');
const { apenas } = require('../middlewares/auth');

router.get('/publicas', ctrl.listarPublicas);
router.get('/matriculas/todas', auth, ctrl.listarTodasMatriculas);
router.get('/', auth, ctrl.listar);
router.post('/', auth, apenas('coordenador'), ctrl.criar);
router.post('/:turma_id/matriculas', auth, apenas('professor', 'coordenador'), ctrl.adicionarAluno);
router.get('/:turma_id/matriculas', auth, apenas('professor', 'coordenador'), ctrl.listarMatriculas);
router.patch('/matriculas/:matricula_id/aprovar', auth, apenas('professor', 'coordenador'), ctrl.aprovarMatricula);

module.exports = router;