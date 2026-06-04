const router = require('express').Router();
const ctrl = require('../controllers/projetoController');
const auth = require('../middlewares/auth');
const { apenas } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, ctrl.listar);
router.post('/', auth, apenas('professor', 'coordenador'), ctrl.criar);
router.post('/aluno', auth, apenas('aluno'), ctrl.enviarAluno);
router.get('/:id', auth, ctrl.buscarPorId);
router.post('/:id/upload', auth, upload.single('arquivo'), ctrl.uploadArquivo);
router.delete('/:id', auth, apenas('coordenador'), ctrl.deletar);
router.patch('/:id/categoria', auth, apenas('coordenador'), ctrl.vincularCategoria);
router.post('/:id/curtir', auth, apenas('empresa_parceira'), ctrl.curtir);
router.get('/:id/curtidas', auth, ctrl.getCurtidas);

module.exports = router;