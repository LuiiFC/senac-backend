import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

export default function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({ titulo: '', descricao: '', turma_id: '' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const navigate = useNavigate();

  const carregar = () => {
    api.get('/projetos').then(r => setProjetos(r.data));
    api.get('/turmas').then(r => setTurmas(r.data));
  };
  useEffect(() => { carregar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/projetos', form);
    setMostrarForm(false);
    carregar();
  };

  const cores = { em_andamento: '#1565C0', concluido: '#1A7A4A', arquivado: '#999' };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>Projetos</h1>
          <button style={styles.btn} onClick={() => setMostrarForm(!mostrarForm)}>+ Novo Projeto</button>
        </div>
        {mostrarForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={{ marginBottom: 16 }}>Cadastrar Projeto</h3>
            <div style={styles.grid}>
              <div style={{ gridColumn: '1/-1' }}><label style={styles.label}>Título</label><input style={styles.input} value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={styles.label}>Descrição</label><textarea style={{ ...styles.input, height: 80, resize: 'vertical' }} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
              <div>
                <label style={styles.label}>Turma</label>
                <select style={styles.input} value={form.turma_id} onChange={e => setForm({...form, turma_id: e.target.value})} required>
                  <option value="">Selecione...</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} — {t.curso}</option>)}
                </select>
              </div>
            </div>
            <button style={styles.btn} type="submit">Salvar</button>
          </form>
        )}
        <div style={styles.cards}>
          {projetos.map(p => (
            <div key={p.id} style={styles.card} onClick={() => navigate(`/projetos/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={styles.cardTitulo}>{p.titulo}</p>
                <span style={{ ...styles.badge, background: cores[p.status] + '20', color: cores[p.status] }}>{p.status.replace('_', ' ')}</span>
              </div>
              <p style={styles.cardDesc}>{p.descricao || 'Sem descrição'}</p>
              {p.turmas && <p style={styles.cardInfo}>🎓 {p.turmas.nome} — {p.turmas.curso}</p>}
              {p.usuarios && <p style={styles.cardInfo}>👨‍🏫 {p.usuarios.nome}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  main: { flex: 1, padding: 40, background: '#F8F7F5' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 },
  btn: { background: '#C8102E', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  form: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', borderTop: '4px solid #C8102E' },
  cardTitulo: { fontWeight: 700, fontSize: 16, color: '#1A1A1A', margin: '0 0 8px', flex: 1 },
  cardDesc: { color: '#666', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 },
  cardInfo: { color: '#888', fontSize: 12, margin: '4px 0' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' },
};