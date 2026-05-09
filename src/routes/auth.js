const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { auth, apenas } = require('../middlewares/auth');

router.post('/login', ctrl.login);
router.post('/registrar', ctrl.registrar);
router.post('/cadastrar', auth, apenas('coordenador'), ctrl.cadastrar);
router.post('/esqueceu-senha', ctrl.esqueceuSenha);
router.post('/alterar-senha', auth, ctrl.alterarSenha);

module.exports = router;