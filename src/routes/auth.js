const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { apenas } = require('../middlewares/auth');

console.log('✅ auth routes carregado, esqueceuSenha:', typeof ctrl.esqueceuSenha);

router.post('/login', ctrl.login);
router.post('/registrar', ctrl.registrar);
router.post('/cadastrar', auth, apenas('coordenador'), ctrl.cadastrar);
router.post('/esqueceu-senha', ctrl.esqueceuSenha);

module.exports = router;