import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

export default function Projetos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // ==================== ESTADOS ====================
  const [projetos, setProjetos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [uploadando, setUploadando] = useState(false);
  const [drag, setDrag] = useState(false);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    turma_id: '',
  });

  // ==================== PERMISSÕES ====================
  const podeCriar = usuario?.tipo === 'coordenador' || usuario?.tipo === 'professor';
  const podeEnviar = usuario?.tipo === 'aluno';

  const getTitulo = () => {
    if (usuario?.tipo === 'aluno') return 'Meus Projetos';
    if (usuario?.tipo === 'professor') return 'Projetos das Turmas';
    return 'Projetos do Curso';
  };

  // ==================== CARREGAMENTO ====================
  const carregar = async () => {
    try {
      const [projRes, turmaRes] = await Promise.all([
        api.get('/projetos'),
        api.get('/turmas')
      ]);
      setProjetos(projRes.data);
      setTurmas(turmaRes.data);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // ==================== ENVIO DE PROJETO ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return alert('Título é obrigatório');

    try {
      const rota = podeEnviar ? '/projetos/aluno' : '/projetos';
      const res = await api.post(rota, form);
      const novoProjeto = res.data;

      if (arquivo) {
        await enviarArquivo(novoProjeto.id);
      }

      alert('✅ Projeto enviado com sucesso!');
      resetForm();
      carregar();
    } catch (err) {
      alert('❌ Erro ao enviar projeto: ' + (err.response?.data?.erro || err.message));
    }
  };

  const enviarArquivo = async (projetoId) => {
    setUploadando(true);
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    try {
      await api.post(`/projetos/${projetoId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      console.error('Erro no upload:', err);
    } finally {
      setUploadando(false);
    }
  };

  const resetForm = () => {
    setForm({ titulo: '', descricao: '', turma_id: '' });
    setArquivo(null);
    setMostrarForm(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) setArquivo(file);
  };

  // ==================== RENDER ====================
  const cores = { em_andamento: '#1565C0', concluido: '#1A7A4A', arquivado: '#999' };
  const tiposAceitos = '.py,.pptx,.pdf,.zip,.rar,.exe,.ipynb,.docx,.xlsx,.txt,.mp4,.png,.jpg,.jpeg';

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>{getTitulo()}</h1>

          <div style={{ display: 'flex', gap: 12 }}>
            {podeCriar && (
              <button style={styles.btn} onClick={() => setMostrarForm(!mostrarForm)}>
                + Novo Projeto
              </button>
            )}
            {podeEnviar && (
              <button style={styles.btn} onClick={() => setMostrarForm(!mostrarForm)}>
                + Enviar Projeto
              </button>
            )}
          </div>
        </div>

        {/* ==================== FORMULÁRIO ==================== */}
        {mostrarForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={{ marginBottom: 16 }}>Cadastrar Projeto</h3>

            <div style={styles.grid}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={styles.label}>Título</label>
                <input
                  style={styles.input}
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  required
                />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={styles.label}>Descrição</label>
                <textarea
                  style={{ ...styles.input, height: 80, resize: 'vertical' }}
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                />
              </div>

              <div>
                <label style={styles.label}>Turma</label>
                <select
                  style={styles.input}
                  value={form.turma_id}
                  onChange={e => setForm({ ...form, turma_id: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} — {t.curso}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropzone de Arquivo */}
            <div
              style={{ ...styles.dropZone, ...(drag ? styles.dropZoneAtivo : {}) }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              {/* ... (seu código do dropzone permanece igual) */}
            </div>

            <button style={styles.btn} type="submit" disabled={uploadando}>
              {uploadando ? 'Enviando arquivo...' : 'Salvar Projeto'}
            </button>
          </form>
        )}

        {/* Lista de Projetos */}
        <div style={styles.cards}>
          {projetos.map(p => (
            <div key={p.id} style={styles.card} onClick={() => navigate(`/projetos/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={styles.cardTitulo}>{p.titulo}</p>
                <span style={{ ...styles.badge, background: cores[p.status] + '20', color: cores[p.status] }}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              <p style={styles.cardDesc}>{p.descricao || 'Sem descrição'}</p>
              {p.turmas && <p style={styles.cardInfo}>🎓 {p.turmas.nome} — {p.turmas.curso}</p>}
              {p.usuarios && <p style={styles.cardInfo}>👨‍🏫 {p.usuarios.nome}</p>}
              {p.arquivo_url && <p style={styles.cardArquivo}>📎 Arquivo anexado</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ==================== STYLES ==================== */
const styles = { /* ... seus estilos permanecem iguais ... */ };