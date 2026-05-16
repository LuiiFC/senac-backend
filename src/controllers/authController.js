exports.cadastrar = async (req, res) => {
  const { nome, email, senha, tipo, matricula, curso, curso_vinculo } = req.body;
  const { tipo: tipoAdmin } = req.usuario;

  // coordenador só pode criar professor
  if (tipoAdmin === 'coordenador' && !['professor'].includes(tipo)) {
    return res.status(403).json({ erro: 'Coordenador só pode cadastrar professores' });
  }

  // admin pode criar qualquer tipo exceto aluno
  if (tipoAdmin === 'admin' && tipo === 'aluno') {
    return res.status(403).json({ erro: 'Use o registro público para cadastrar alunos' });
  }

  const senha_hash = await bcrypt.hash(senha, 10);
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nome, email, senha_hash, tipo, matricula, curso, curso_vinculo }])
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
};