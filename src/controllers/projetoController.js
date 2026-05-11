const supabase = require('../config/supabase');

exports.listar = async (req, res) => {
  const { data, error } = await supabase
    .from('projetos')
    .select('*, turmas(nome, curso), usuarios!professor_orientador_id(nome), projeto_alunos(aluno_id, usuarios(nome))');
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};

exports.criar = async (req, res) => {
  const { titulo, descricao, turma_id, alunos_ids } = req.body;
  const { id: professor_orientador_id, tipo, curso_vinculo } = req.usuario;

  if (tipo === 'professor') {
    const { data: turma } = await supabase.from('turmas').select('curso').eq('id', turma_id).single();
    if (turma?.curso !== curso_vinculo)
      return res.status(403).json({ erro: 'Você só pode criar projetos no seu curso' });
  }

  const { data: projeto, error } = await supabase
    .from('projetos')
    .insert([{ titulo, descricao, turma_id, professor_orientador_id }])
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });

  if (alunos_ids?.length) {
    const relacoes = alunos_ids.map(aluno_id => ({ projeto_id: projeto.id, aluno_id }));
    await supabase.from('projeto_alunos').insert(relacoes);
  }
  res.status(201).json(projeto);
};

exports.buscarPorId = async (req, res) => {
  const { data, error } = await supabase
    .from('projetos')
    .select('*, turmas(nome, curso), usuarios!professor_orientador_id(nome), projeto_alunos(aluno_id, usuarios(nome))')
    .eq('id', req.params.id).single();
  if (error) return res.status(404).json({ erro: 'Projeto não encontrado' });
  res.json(data);
};

exports.enviarAluno = async (req, res) => {
  const { titulo, descricao, turma_id } = req.body;
  const aluno_id = req.usuario.id;

  const { data: matricula } = await supabase
    .from('matriculas')
    .select('*').eq('aluno_id', aluno_id).eq('turma_id', turma_id).single();

  if (!matricula) return res.status(403).json({ erro: 'Você não está matriculado nesta turma' });

  const { data: projeto, error } = await supabase
    .from('projetos')
    .insert([{ titulo, descricao, turma_id, professor_orientador_id: null }])
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });

  await supabase.from('projeto_alunos').insert([{ projeto_id: projeto.id, aluno_id }]);
  res.status(201).json(projeto);
};

exports.uploadArquivo = async (req, res) => {
  const { id } = req.params;
  const arquivo = req.file;

  if (!arquivo) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

  const nomeArquivo = `${Date.now()}_${arquivo.originalname}`;

  const { data, error } = await supabase.storage
    .from('projetos')
    .upload(nomeArquivo, arquivo.buffer, {
      contentType: arquivo.mimetype,
      upsert: false,
    });

  if (error) return res.status(400).json({ erro: error.message });

  const { data: urlData } = supabase.storage
    .from('projetos')
    .getPublicUrl(nomeArquivo);

  await supabase
    .from('projetos')
    .update({ arquivo_url: urlData.publicUrl })
    .eq('id', id);

  res.json({ url: urlData.publicUrl });
};

exports.uploadArquivo = async (req, res) => {
  const { id } = req.params;
  const arquivo = req.file;

  if (!arquivo) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

  const nomeArquivo = `${Date.now()}_${arquivo.originalname}`;

  const { data, error } = await supabase.storage
    .from('projetos')
    .upload(nomeArquivo, arquivo.buffer, {
      contentType: arquivo.mimetype,
      upsert: false,
    });

  if (error) return res.status(400).json({ erro: error.message });

  const { data: urlData } = supabase.storage
    .from('projetos')
    .getPublicUrl(nomeArquivo);

  await supabase
    .from('projetos')
    .update({ arquivo_url: urlData.publicUrl })
    .eq('id', id);

  res.json({ url: urlData.publicUrl });
};

exports.deletar = async (req, res) => {
  const { error } = await supabase
    .from('projetos')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(400).json({ erro: error.message });
  res.json({ mensagem: 'Projeto deletado com sucesso' });
};

exports.vincularCategoria = async (req, res) => {
  const { categoria_id } = req.body;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('projetos')
    .update({ categoria_id })
    .eq('id', id)
    .select().single();

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
};