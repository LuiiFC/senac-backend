const supabase = require('../config/supabase');

exports.listar = async (req, res) => {
  const { tipo, curso_vinculo } = req.usuario;
  let query = supabase.from('turmas').select('*, usuarios!coordenador_id(nome)');

  if (tipo === 'professor')
    query = query.eq('curso', curso_vinculo);

  const { data, error } = await query;
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.criar = async (req, res) => {
  const { nome, curso, ano, semestre, coordenador_id } = req.body;
  const { data, error } = await supabase
    .from('turmas')
    .insert([{ nome, curso, ano, semestre, coordenador_id }])
    .select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
};

exports.aprovarMatricula = async (req, res) => {
  const { matricula_id } = req.params;
  const { data, error } = await supabase
    .from('matriculas')
    .update({ aprovado: true })
    .eq('id', matricula_id)
    .select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.listarMatriculas = async (req, res) => {
  const { turma_id } = req.params;
  const { data, error } = await supabase
    .from('matriculas')
    .select('*, usuarios!aluno_id(nome, email, matricula)')
    .eq('turma_id', turma_id);
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.listarPublicas = async (req, res) => {
  const { data, error } = await supabase
    .from('turmas')
    .select('id, nome, curso, ano, semestre');
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.adicionarAluno = async (req, res) => {
  const { turma_id } = req.params;
  const { aluno_id } = req.body;

  const { data, error } = await supabase
    .from('matriculas')
    .insert([{ aluno_id, turma_id, aprovado: true }])
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
};

exports.listarTodasMatriculas = async (req, res) => {
  const { data, error } = await supabase
    .from('matriculas')
    .select('aluno_id');
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};