const supabase = require('../config/supabase');

exports.listar = async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, tipo, matricula, curso, ativo, criado_em');

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.buscarPorId = async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, tipo, matricula, curso, ativo, criado_em')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(data);
};

exports.atualizar = async (req, res) => {
  const { nome, curso, matricula } = req.body;

  const { data, error } = await supabase
    .from('usuarios')
    .update({ nome, curso, matricula })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.deletar = async (req, res) => {
  const { error } = await supabase
    .from('usuarios')
    .update({ ativo: false })
    .eq('id', req.params.id);

  if (error) return res.status(400).json({ erro: error.message });
  res.json({ mensagem: 'Usuário desativado com sucesso' });
};