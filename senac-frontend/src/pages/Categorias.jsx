import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

export default function Categorias() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [form, setForm] = useState({ nome: '', curso: '', descricao: '' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [categoriaAberta, setCategoriaAberta] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const carregar = async () => {
    const [catRes, projRes] = await Promise.all([
      api.get('/categorias'),
      api.get('/projetos'),
    ]);
    setCategorias(catRes.data);
    setProjetos(projRes.data);
  };

  useEffect(() => {
    const init = async () => { await carregar(); };
    init();
  }, []);

  const handleCriar = async (e) => {
    e.preventDefault();
    await api.post('/categorias', form);
    setForm({ nome: '', curso: '', descricao: '' });
    setMostrarForm(false);
    carregar();
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta pasta?')) return;
    await api.delete(`/categorias/${id}`);
    carregar();
  };

  const handleDeletarProjeto = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja deletar este projeto?')) return;
    await api.delete(`/projetos/${id}`);
    carregar();
  };

const handleDragStart = (e, projetoId) => {
  if (usuario?.tipo === 'aluno' || usuario?.tipo === 'professor') return;
  e.dataTransfer.setData('projetoId', projetoId);
};

const handleDrop = async (e, categoriaId) => {
  if (usuario?.tipo === 'aluno' || usuario?.tipo === 'professor') return;
  e.preventDefault();
  setDragOver(null);
  const projetoId = e.dataTransfer.getData('projetoId');
  if (!projetoId) return;
  await api.patch(`/projetos/${projetoId}/categoria`, { categoria_id: categoriaId });
  carregar();
};


  const handleRemoverCategoria = async (projetoId, e) => {
    e.stopPropagation();
    await api.patch(`/projetos/${projetoId}/categoria`, { categoria_id: null });
    carregar();
  };

  const projetosDaCategoria = (categoriaId) =>
    projetos.filter(p => p.categoria_id === categoriaId);

  const projetosSemCategoria = projetos.filter(p => !p.categoria_id);

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>📁 Pastas de Cursos</h1>
          {usuario?.tipo === 'coordenador' && (
            <button style={styles.btn} onClick={() => setMostrarForm(!mostrarForm)}>
              + Nova Pasta
            </button>
          )}
        </div>

        {mostrarForm && (
          <form onSubmit={handleCriar} style={styles.form}>
            <h3 style={{ marginBottom: 16 }}>Criar Pasta de Curso</h3>
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Nome da Pasta</label>
                <input style={styles.input} value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Projetos 2025" required />
              </div>
              <div>
                <label style={styles.label}>Curso</label>
                <input style={styles.input} value={form.curso} onChange={e => setForm({...form, curso: e.target.value})} placeholder="Ex: Análise e Desenvolvimento" required />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={styles.label}>Descrição</label>
                <input style={styles.input} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Descrição opcional" />
              </div>
            </div>
            <button style={styles.btn} type="submit">Salvar</button>
          </form>
        )}

        {/* Projetos sem categoria — área de arrastar */}
        {projetosSemCategoria.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={styles.sectionTitulo}>📋 Projetos disponíveis — arraste para uma pasta</h2>
            <div style={styles.projetosDisponiveis}>
              {projetosSemCategoria.map(p => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={e => handleDragStart(e, p.id)}
                  style={styles.projetoCard}
                  onClick={() => navigate(`/projetos/${p.id}`)}
                >
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <p style={styles.projetoNome}>{p.titulo}</p>
                    {p.turmas && <p style={styles.projetoInfo}>{p.turmas.curso}</p>}
                  </div>
                  {usuario?.tipo === 'coordenador' && (
                    <button style={styles.btnDeletar} onClick={e => handleDeletarProjeto(p.id, e)}>🗑️</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pastas */}
        <div style={styles.pastas}>
          {categorias.map(cat => (
            <div
              key={cat.id}
              style={{ ...styles.pasta, ...(dragOver === cat.id ? styles.pastaDestaque : {}) }}
              onDragOver={e => { e.preventDefault(); setDragOver(cat.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, cat.id)}
            >
              <div style={styles.pastaHeader} onClick={() => setCategoriaAberta(categoriaAberta === cat.id ? null : cat.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{dragOver === cat.id ? '📂' : '📁'}</span>
                  <div>
                    <p style={styles.pastaNome}>{cat.nome}</p>
                    <p style={styles.pastaCurso}>{cat.curso}</p>
                    {cat.descricao && <p style={styles.pastaDesc}>{cat.descricao}</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={styles.pastaCount}>{projetosDaCategoria(cat.id).length} projetos</span>
                  {usuario?.tipo === 'coordenador' && (
                    <button style={styles.btnDeletar} onClick={e => { e.stopPropagation(); handleDeletar(cat.id); }}>🗑️</button>
                  )}
                  <span style={{ color: '#888' }}>{categoriaAberta === cat.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {dragOver === cat.id && (
                <div style={styles.dropHint}>Solte aqui para adicionar à pasta</div>
              )}

              {categoriaAberta === cat.id && (
                <div style={styles.pastaConteudo}>
                  {projetosDaCategoria(cat.id).length === 0 ? (
                    <p style={styles.vazio}>Arraste projetos para esta pasta.</p>
                  ) : (
                    projetosDaCategoria(cat.id).map(p => (
                      <div
                        key={p.id}
                        style={styles.projetoItem}
                        draggable
                        onDragStart={e => handleDragStart(e, p.id)}
                        onClick={() => navigate(`/projetos/${p.id}`)}
                      >
                        <div style={{ flex: 1 }}>
                          <p style={styles.projetoNome}>📄 {p.titulo}</p>
                          {p.turmas && <p style={styles.projetoInfo}>🎓 {p.turmas.nome} — {p.turmas.curso}</p>}
                          {p.arquivo_url && <p style={styles.projetoArquivo}>📎 Arquivo anexado</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {usuario?.tipo === 'coordenador' && (
                            <>
                              <button style={styles.btnRemover} onClick={e => handleRemoverCategoria(p.id, e)} title="Remover da pasta">↩️</button>
                              <button style={styles.btnDeletar} onClick={e => handleDeletarProjeto(p.id, e)}>🗑️</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {categorias.length === 0 && (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 40 }}>📁</p>
            <p style={styles.emptyText}>Nenhuma pasta criada ainda.</p>
            {usuario?.tipo === 'coordenador' && (
              <p style={styles.emptySub}>Clique em "+ Nova Pasta" para começar.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  main: { flex: 1, padding: 40, background: '#F8F7F5' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 },
  btn: { background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  form: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  sectionTitulo: { fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 },
  projetosDisponiveis: { display: 'flex', flexDirection: 'column', gap: 8 },
  projetoCard: { background: '#fff', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'grab', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', border: '2px dashed #ddd' },
  pastas: { display: 'flex', flexDirection: 'column', gap: 12 },
  pasta: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' },
  pastaDestaque: { border: '2px solid #FF6B35', boxShadow: '0 4px 16px rgba(200,16,46,0.15)' },
  pastaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', borderLeft: '4px solid #C8102E' },
  pastaNome: { fontWeight: 700, fontSize: 16, color: '#1A1A1A', margin: 0 },
  pastaCurso: { color: '#FF6B35', fontSize: 13, fontWeight: 600, margin: '2px 0 0' },
  pastaDesc: { color: '#888', fontSize: 12, margin: '2px 0 0' },
  pastaCount: { background: '#F3F2F0', color: '#666', padding: '4px 10px', borderRadius: 20, fontSize: 12 },
  dropHint: { background: '#FFF5F5', color: '#FF6B35', textAlign: 'center', padding: '8px', fontSize: 13, fontWeight: 600 },
  pastaConteudo: { borderTop: '1px solid #F0F0F0', padding: '8px 0' },
  projetoItem: { display: 'flex', alignItems: 'center', padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid #F8F7F5', gap: 12 },
  projetoNome: { fontWeight: 600, fontSize: 14, color: '#1A1A1A', margin: 0 },
  projetoInfo: { color: '#888', fontSize: 12, margin: '4px 0 0' },
  projetoArquivo: { color: '#1565C0', fontSize: 12, margin: '4px 0 0', fontWeight: 600 },
  btnDeletar: { background: '#FEE2E2', color: '#FF6B35', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
  btnRemover: { background: '#F3F2F0', color: '#666', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
  vazio: { color: '#999', fontSize: 13, textAlign: 'center', padding: '20px' },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: 18, fontWeight: 600, color: '#555', margin: '8px 0 4px' },
  emptySub: { color: '#888', fontSize: 14 },
};