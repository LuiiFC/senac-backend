const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  const { data: usuario } = await supabase
    .from('usuarios').select('*').eq('email', email).single();

  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) return res.status(401).json({ erro: 'Senha incorreta' });

  const token = jwt.sign(
    { id: usuario.id, tipo: usuario.tipo, nome: usuario.nome, curso: usuario.curso, curso_vinculo: usuario.curso_vinculo },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, tipo: usuario.tipo, curso: usuario.curso, curso_vinculo: usuario.curso_vinculo } });
};

exports.cadastrar = async (req, res) => {
  const { nome, email, senha, tipo, matricula, curso, curso_vinculo } = req.body;
  const senha_hash = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nome, email, senha_hash, tipo, matricula, curso, curso_vinculo }])
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
};

exports.registrar = async (req, res) => {
  const { nome, email, senha, matricula, curso, turma_id } = req.body;
  const senha_hash = await bcrypt.hash(senha, 10);

  const { data: aluno, error } = await supabase
    .from('usuarios')
    .insert([{ nome, email, senha_hash, tipo: 'aluno', matricula, curso }])
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });

  if (turma_id) {
    await supabase.from('matriculas').insert([{ aluno_id: aluno.id, turma_id, aprovado: false }]);
  }

  res.status(201).json(aluno);
};