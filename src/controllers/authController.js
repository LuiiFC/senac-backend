const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const supabase = require('../config/supabase');

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const { tipo: tipoAdmin } = req.usuario;

  if (tipoAdmin === 'coordenador' && !['professor'].includes(tipo))
    return res.status(403).json({ erro: 'Coordenador só pode cadastrar professores' });

  if (tipoAdmin === 'admin' && tipo === 'aluno')
    return res.status(403).json({ erro: 'Use o registro público para cadastrar alunos' });

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
  if (turma_id) await supabase.from('matriculas').insert([{ aluno_id: aluno.id, turma_id, aprovado: false }]);
  res.status(201).json(aluno);
};

exports.esqueceuSenha = async (req, res) => {
  const { email } = req.body;
  const { data: usuario } = await supabase
    .from('usuarios').select('id, nome, email').eq('email', email).single();

  if (!usuario) return res.status(404).json({ erro: 'Email não encontrado' });

  const novaSenha = Math.random().toString(36).slice(-8);
  const senha_hash = await bcrypt.hash(novaSenha, 10);
  await supabase.from('usuarios').update({ senha_hash }).eq('id', usuario.id);

  await resend.emails.send({
    from: 'SENAC Projetos <onboarding@resend.dev>',
    to: email,
    subject: 'Recuperação de Senha — SENAC',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto"><div style="background:#003366;padding:24px;border-radius:12px 12px 0 0;text-align:center"><h1 style="color:white;margin:0">SENAC</h1></div><div style="background:#fff;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px"><p>Olá, <strong>${usuario.nome}</strong>!</p><p>Sua nova senha temporária é:</p><div style="background:#F8F7F5;border:2px dashed #FF6B35;border-radius:8px;padding:16px;text-align:center;margin:20px 0"><span style="font-size:24px;font-weight:700;color:#FF6B35;letter-spacing:2px">${novaSenha}</span></div><p style="color:#666;font-size:13px">Recomendamos alterar essa senha após fazer login.</p></div></div>`,
  });

  res.json({ mensagem: 'Email enviado com sucesso' });
};

exports.alterarSenha = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  const id = req.usuario.id;

  const { data: usuario } = await supabase
    .from('usuarios').select('senha_hash').eq('id', id).single();

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash);
  if (!senhaCorreta) return res.status(401).json({ erro: 'Senha atual incorreta' });

  const senha_hash = await bcrypt.hash(novaSenha, 10);
  await supabase.from('usuarios').update({ senha_hash }).eq('id', id);
  res.json({ mensagem: 'Senha alterada com sucesso' });
};