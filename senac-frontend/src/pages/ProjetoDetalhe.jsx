import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AvaliacaoCard from '../components/AvaliacaoCard';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProjetoDetalhe() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [projeto, setProjeto] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [form, setForm] = useState({ nota: '', comentario: '' });

  const carregar = () => {
    api.get(`/projetos/${id}`).then(r => setProjeto(r.data));
    api.get(`/avaliacoes/${id}`).then(r => setAvaliacoes(r.data));
  };
  useEffect(() => { carregar(); }, [id]);

  const handleAvaliar = async (e) => {
    e.preventDefault();
    await api.post(`/avaliacoes/${id}`, {
      nota: usuario?.tipo === 'aluno' ? null : parseFloat(form.nota),
      comentario: form.comentario
    });
    setForm({ nota: '', comentario: '' });
    carregar();
  };

  if (!projeto) return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Carregando...</div>;

  const media = avaliacoes.length ? (avaliacoes.reduce((s, a) => s + (a.nota || 0), 0) / avaliacoes.length).toFixed(1) : '—';

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={styles.titulo}>{projeto.titulo}</h1>
              {projeto.turmas && <p style={styles.sub}>🎓 {projeto.turmas.nome} — {projeto.turmas.curso}</p>}
              {projeto.usuarios && <p style={styles.sub}>👨‍🏫 {projeto.usuarios.nome}</p>}
            </div>
            <div style={styles.mediaBox}>
              <p style={styles.mediaNum}>{media}</p>
              <p style={styles.mediaLabel}>Média</p>
            </div>
          </div>
          {projeto.descricao && <p style={styles.desc}>{projeto.descricao}</p>}

          {projeto.arquivo_url && (
            <div style={styles.arquivoBox}>
              <p style={styles.sectionLabel}>📎 Arquivo do projeto</p>
              <a href={projeto.arquivo_url} target="_blank" rel="noopener noreferrer" style={styles.btnDownload}>
                ⬇️ Baixar / Visualizar arquivo
              </a>
            </div>
          )}

          {projeto.projeto_alunos?.length > 0 && (
            <div style={styles.alunosBox}>
              <p style={styles.sectionLabel}>👥 Alunos participantes</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {projeto.projeto_alunos.map(pa => (
                  <span key={pa.aluno_id} style={styles.alunoTag}>{pa.usuarios?.nome}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitulo}>✍️ Avaliar Projeto</h2>
          <form onSubmit={handleAvaliar} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {usuario?.tipo !== 'aluno' && (
              <div>
                <label style={styles.label}>Nota (0–10)</label>
                <input style={{ ...styles.input, width: 100 }} type="number" min="0" max="10" step="0.1" value={form.nota} onChange={e => setForm({...form, nota: e.target.value})} required />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={styles.label}>Comentário</label>
              <input style={styles.input} value={form.comentario} onChange={e => setForm({...form, comentario: e.target.value})} placeholder="Escreva sua avaliação..." required />
            </div>
            <button style={styles.btn} type="submit">Enviar</button>
          </form>
        </div>

        <h2 style={{ ...styles.sectionTitulo, marginBottom: 16 }}>💬 Avaliações ({avaliacoes.length})</h2>
        {avaliacoes.length === 0
          ? <p style={{ color: '#999', fontFamily: 'sans-serif' }}>Nenhuma avaliação ainda.</p>
          : avaliacoes.map(a => <AvaliacaoCard key={a.id} avaliacao={a} />)
        }
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  main: { flex: 1, padding: 40, background: '#F8F7F5' },
  card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  titulo: { fontSize: 26, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' },
  sub: { color: '#666', fontSize: 14, margin: '4px 0' },
  desc: { color: '#444', fontSize: 15, lineHeight: 1.6, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F0F0' },
  mediaBox: { textAlign: 'center', background: '#F8F7F5', borderRadius: 12, padding: '12px 20px' },
  mediaNum: { fontSize: 32, fontWeight: 700, color: '#C8102E', margin: 0 },
  mediaLabel: { color: '#666', fontSize: 12, margin: 0 },
  arquivoBox: { marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F0F0' },
  btnDownload: { display: 'inline-block', background: '#1565C0', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600, marginTop: 8 },
  alunosBox: { marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F0F0' },
  sectionLabel: { color: '#555', fontSize: 13, fontWeight: 600, marginBottom: 8 },
  alunoTag: { background: '#E3F0FF', color: '#1565C0', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 },
  sectionTitulo: { fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px' },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  btn: { background: '#C8102E', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
};