const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

const apenas = (...tiposPermitidos) => (req, res, next) => {
  if (!req.usuario || !tiposPermitidos.includes(req.usuario.tipo))
    return res.status(403).json({ erro: 'Acesso negado.' });
  next();
};

module.exports = auth;
module.exports.apenas = apenas;