const supabase = require('../config/supabase');

exports.listar = async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('curso', { ascending: true });
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.criar = async (req, res) => {
  const { nome, curso, descricao } = req.body;
  const { data, error } = await supabase
    .from('categorias')
    .insert([{ nome, curso, descricao }])
    .select().single();
  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
};

exports.deletar = async (req, res) => {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(400).json({ erro: error.message });
  res.json({ mensagem: 'Categoria deletada com sucesso' });
};