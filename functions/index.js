const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

// ========== AUTH ==========

app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  const { data: usuario } = await supabase.from('usuarios').select('*').eq('email', email).single();
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) return res.status(401).json({ erro: 'Senha incorreta' });
  const token = jwt.sign(
    { id: usuario.id, tipo: usuario.tipo, nome: usuario.nome, curso: usuario.curso, curso_vinculo: usuario.curso_vinculo },
    JWT_SECRET, { expiresIn: '8h' }
  );
  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, tipo: usuario.tipo, curso: usuario.curso, curso_vinculo: usuario.curso_vinculo } });
});

app.post('/auth/cadastrar', async (req, res) => {
  const { nome, email, senha, tipo, matricula, curso, curso_vinculo } = req.body;
  const senha_hash = await bcrypt.hash(senha, 10);
  const { data, error } = await supabase.from('usuarios').insert([{ nome, email, senha_hash, tipo, matricula, curso, curso_vinculo }]).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
});

app.post('/auth/registrar', async (req, res) => {
  const { nome, email, senha, matricula, curso, turma_id } = req.body;
  const senha_hash = await bcrypt.hash(senha, 10);
  const { data: aluno, error } = await supabase.from('usuarios').insert([{ nome, email, senha_hash, tipo: 'aluno', matricula, curso }]).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  if (turma_id) await supabase.from('matriculas').insert([{ aluno_id: aluno.id, turma_id, aprovado: false }]);
  res.status(201).json(aluno);
});

app.post('/auth/esqueceu-senha', async (req, res) => {
  const { email } = req.body;
  const { data: usuario } = await supabase.from('usuarios').select('id, nome, email').eq('email', email).single();
  if (!usuario) return res.status(404).json({ erro: 'Email não encontrado' });
  const novaSenha = Math.random().toString(36).slice(-8);
  const senha_hash = await bcrypt.hash(novaSenha, 10);
  await supabase.from('usuarios').update({ senha_hash }).eq('id', usuario.id);
  await resend.emails.send({
    from: 'SENAC Projetos <onboarding@resend.dev>',
    to: email,
    subject: 'Recuperação de Senha — SENAC',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:auto"><div style="background:#C8102E;padding:24px;border-radius:12px 12px 0 0;text-align:center"><h1 style="color:white;margin:0">SENAC</h1></div><div style="background:#fff;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px"><p>Olá, <strong>${usuario.nome}</strong>!</p><p>Sua nova senha temporária é:</p><div style="background:#F8F7F5;border:2px dashed #C8102E;border-radius:8px;padding:16px;text-align:center;margin:20px 0"><span style="font-size:24px;font-weight:700;color:#C8102E">${novaSenha}</span></div><p style="color:#666;font-size:13px">Recomendamos alterar essa senha após fazer login.</p></div></div>`,
  });
  res.json({ mensagem: 'Email enviado com sucesso' });
});

app.post('/auth/alterar-senha', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  const decoded = jwt.verify(token, JWT_SECRET);
  const { senhaAtual, novaSenha } = req.body;
  const { data: usuario } = await supabase.from('usuarios').select('senha_hash').eq('id', decoded.id).single();
  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash);
  if (!senhaCorreta) return res.status(401).json({ erro: 'Senha atual incorreta' });
  const senha_hash = await bcrypt.hash(novaSenha, 10);
  await supabase.from('usuarios').update({ senha_hash }).eq('id', decoded.id);
  res.json({ mensagem: 'Senha alterada com sucesso' });
});

// ========== MIDDLEWARE AUTH ==========
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });
  try { req.usuario = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ erro: 'Token inválido' }); }
};

// ========== USUARIOS ==========
app.get('/usuarios', auth, async (req, res) => {
  const { data, error } = await supabase.from('usuarios').select('id, nome, email, tipo, matricula, curso, curso_vinculo, ativo, criado_em');
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// ========== TURMAS ==========
app.get('/turmas/publicas', async (req, res) => {
  const { data, error } = await supabase.from('turmas').select('id, nome, curso, ano, semestre');
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

app.get('/turmas/matriculas/todas', auth, async (req, res) => {
  const { data, error } = await supabase.from('matriculas').select('aluno_id');
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

app.get('/turmas', auth, async (req, res) => {
  const { tipo, curso_vinculo } = req.usuario;
  let query = supabase.from('turmas').select('*, usuarios!coordenador_id(nome)');
  if (tipo === 'professor') query = query.eq('curso', curso_vinculo);
  const { data, error } = await query;
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

app.post('/turmas', auth, async (req, res) => {
  const { nome, curso, ano, semestre, coordenador_id } = req.body;
  const { data, error } = await supabase.from('turmas').insert([{ nome, curso, ano, semestre, coordenador_id }]).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
});

app.get('/turmas/:turma_id/matriculas', auth, async (req, res) => {
  const { data, error } = await supabase.from('matriculas').select('*, usuarios!aluno_id(nome, email, matricula)').eq('turma_id', req.params.turma_id);
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

app.post('/turmas/:turma_id/matriculas', auth, async (req, res) => {
  const { aluno_id } = req.body;
  const { data, error } = await supabase.from('matriculas').insert([{ aluno_id, turma_id: req.params.turma_id, aprovado: true }]).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
});

app.patch('/turmas/matriculas/:matricula_id/aprovar', auth, async (req, res) => {
  const { data, error } = await supabase.from('matriculas').update({ aprovado: true }).eq('id', req.params.matricula_id).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// ========== PROJETOS ==========
app.get('/projetos', auth, async (req, res) => {
  const { data, error } = await supabase.from('projetos').select('*, turmas(nome, curso), usuarios!professor_orientador_id(nome), projeto_alunos(aluno_id, usuarios(nome))');
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

app.post('/projetos', auth, async (req, res) => {
  const { titulo, descricao, turma_id, alunos_ids } = req.body;
  const professor_orientador_id = req.usuario.id;
  const { data: projeto, error } = await supabase.from('projetos').insert([{ titulo, descricao, turma_id, professor_orientador_id }]).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  if (alunos_ids?.length) await supabase.from('projeto_alunos').insert(alunos_ids.map(aluno_id => ({ projeto_id: projeto.id, aluno_id })));
  res.status(201).json(projeto);
});

app.post('/projetos/aluno', auth, async (req, res) => {
  const { titulo, descricao, turma_id } = req.body;
  const aluno_id = req.usuario.id;
  const { data: matricula } = await supabase.from('matriculas').select('*').eq('aluno_id', aluno_id).eq('turma_id', turma_id).single();
  if (!matricula) return res.status(403).json({ erro: 'Você não está matriculado nesta turma' });
  const { data: projeto, error } = await supabase.from('projetos').insert([{ titulo, descricao, turma_id, professor_orientador_id: null }]).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  await supabase.from('projeto_alunos').insert([{ projeto_id: projeto.id, aluno_id }]);
  res.status(201).json(projeto);
});

app.get('/projetos/:id', auth, async (req, res) => {
  const { data, error } = await supabase.from('projetos').select('*, turmas(nome, curso), usuarios!professor_orientador_id(nome), projeto_alunos(aluno_id, usuarios(nome))').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ erro: 'Projeto não encontrado' });
  res.json(data);
});

// ========== AVALIACOES ==========
app.get('/avaliacoes/:projeto_id', auth, async (req, res) => {
  const { data, error } = await supabase.from('avaliacoes').select('*, usuarios!avaliador_id(nome, tipo)').eq('projeto_id', req.params.projeto_id).order('criado_em', { ascending: false });
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

app.post('/avaliacoes/:projeto_id', auth, async (req, res) => {
  const { nota, comentario } = req.body;
  const { id: avaliador_id, tipo, curso_vinculo } = req.usuario;
  if (tipo === 'aluno' && nota) return res.status(403).json({ erro: 'Alunos não podem dar notas' });
  if (tipo === 'professor') {
    const { data: projeto } = await supabase.from('projetos').select('turmas(curso)').eq('id', req.params.projeto_id).single();
    if (projeto?.turmas?.curso !== curso_vinculo) return res.status(403).json({ erro: 'Você só pode avaliar projetos do seu curso' });
  }
  const tipo_avaliador = tipo === 'aluno' ? 'aluno' : 'professor';
  const { data, error } = await supabase.from('avaliacoes').insert([{ projeto_id: req.params.projeto_id, avaliador_id, nota: tipo === 'aluno' ? null : nota, comentario, tipo_avaliador }]).select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
});

exports.api = functions.https.onRequest(app);