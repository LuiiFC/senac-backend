const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const supabase = require('../config/supabase');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

exports.esqueceuSenha = async (req, res) => {
  const { email } = req.body;

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nome, email')
    .eq('email', email)
    .single();

  if (!usuario) return res.status(404).json({ erro: 'Email não encontrado' });

  const novaSenha = Math.random().toString(36).slice(-8);
  const senha_hash = await bcrypt.hash(novaSenha, 10);

  await supabase
    .from('usuarios')
    .update({ senha_hash })
    .eq('id', usuario.id);

  await transporter.sendMail({
    from: `"SENAC Projetos" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperação de Senha — SENAC',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <div style="background: #C8102E; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SENAC</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Sistema de Projetos Integrados</p>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
          <p>Olá, <strong>${usuario.nome}</strong>!</p>
          <p>Recebemos uma solicitação de recuperação de senha para sua conta.</p>
          <p>Sua nova senha temporária é:</p>
          <div style="background: #F8F7F5; border: 2px dashed #C8102E; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: 700; color: #C8102E; letter-spacing: 2px;">${novaSenha}</span>
          </div>
          <p style="color: #666; font-size: 13px;">Por segurança, recomendamos que você altere essa senha após fazer login.</p>
          <p style="color: #999; font-size: 12px;">Se você não solicitou a recuperação de senha, ignore este email.</p>
        </div>
      </div>
    `,
  });

  res.json({ mensagem: 'Email enviado com sucesso' });
};