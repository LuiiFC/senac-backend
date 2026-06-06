const supabase = require('../config/supabase');

exports.listarPorProjeto = async (req, res) => {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*, usuarios!avaliador_id(nome, tipo)')
    .eq('projeto_id', req.params.projeto_id)
    .order('criado_em', { ascending: false });
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.criar = async (req, res) => {
  const { nota, comentario } = req.body;
  const { projeto_id } = req.params;
  const { id: avaliador_id, tipo, curso_vinculo } = req.usuario;

  if (tipo === 'aluno' && nota)
    return res.status(403).json({ erro: 'Alunos não podem dar notas' });

  if (tipo === 'professor') {
    const { data: projeto } = await supabase
      .from('projetos')
      .select('turmas(curso)')
      .eq('id', projeto_id).single();

    if (projeto?.turmas?.curso !== curso_vinculo)
      return res.status(403).json({ erro: 'Você só pode avaliar projetos do seu curso' });
  }

  
  const tipo_avaliador = tipo === 'aluno' ? 'aluno' : tipo; // preserva 'coordenador', 'professor', 'empresa_parceira'

  const { data, error } = await supabase
    .from('avaliacoes')
    .insert([{ projeto_id, avaliador_id, nota: tipo === 'aluno' ? null : nota, comentario, tipo_avaliador }])
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
};