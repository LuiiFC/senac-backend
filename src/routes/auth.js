const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { apenas } = require('../middlewares/auth');

router.post('/login', ctrl.login);
router.post('/registrar', ctrl.registrar);
router.post('/cadastrar', auth, apenas('coordenador'), ctrl.cadastrar);

module.exports = router;