const jwt = require('jsonwebtoken');

const verificar = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

const apenas = (...tipos) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    if (!tipos.includes(req.usuario.tipo))
      return res.status(403).json({ erro: 'Acesso negado' });
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};

module.exports = verificar;
module.exports.apenas = apenas;