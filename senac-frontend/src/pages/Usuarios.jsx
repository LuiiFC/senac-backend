import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

export default function Usuarios() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', tipo: 'professor', matricula: '', curso_vinculo: '' });
  const [mostrarForm, setMostrarForm] = useState(false);

  const carregar = () => api.get('/usuarios').then(r => setUsuarios(r.data));
  useEffect(() => { carregar(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/cadastrar', form);
      setMostrarForm(false);
      setForm({ nome: '', email: '', senha: '', tipo: 'professor', matricula: '', curso_vinculo: '' });
      carregar();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.erro || err.message));
    }
  };

  const getTiposDisponiveis = () => {
    if (usuario?.tipo === 'admin') return ['professor', 'coordenador', 'empresa_parceira'];
    if (usuario?.tipo === 'coordenador') return ['professor'];
    return [];
  };

  const cores = { aluno: '#1565C0', professor: '#1A7A4A', coordenador: '#C8102E', admin: '#6B21A8', empresa_parceira: '#B45309' };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>Usuários</h1>
          {(usuario?.tipo === 'admin' || usuario?.tipo === 'coordenador') && (
            <button style={styles.btn} onClick={() => setMostrarForm(!mostrarForm)}>
              + Novo Usuário
            </button>
          )}
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitulo}>
              {usuario?.tipo === 'admin' ? 'Cadastrar Usuário' : 'Cadastrar Professor'}
            </h3>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Nome</label>
                <input style={styles.input} value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Senha</label>
                <input style={styles.input} type="password" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} required />
              </div>
              <div>
                <label style={styles.label}>Matrícula</label>
                <input style={styles.input} value={form.matricula} onChange={e => setForm({...form, matricula: e.target.value})} />
              </div>
              <div>
                <label style={styles.label}>Tipo</label>
                <select style={styles.input} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                  {getTiposDisponiveis().map(t => (
                    <option key={t} value={t}>
                      {t === 'empresa_parceira' ? 'Empresa Parceira' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {form.tipo !== 'empresa_parceira' && (
                <div>
                  <label style={styles.label}>Curso vinculado</label>
                  <input style={styles.input} value={form.curso_vinculo} onChange={e => setForm({...form, curso_vinculo: e.target.value})} placeholder="Ex: Análise e Desenvolvimento" />
                </div>
              )}
            </div>
            <button style={styles.btn} type="submit">Salvar</button>
          </form>
        )}

        <div style={styles.tabela}>
          <div style={styles.theader}>
            <span>Nome</span>
            <span>Email</span>
            <span>Tipo</span>
            <span>Curso Vinculado</span>
            <span>Matrícula</span>
          </div>
          {usuarios.map(u => (
            <div key={u.id} style={styles.trow}>
              <span style={styles.nome}>{u.nome}</span>
              <span style={styles.cell}>{u.email}</span>
              <span style={{ ...styles.badge, background: (cores[u.tipo] || '#666') + '20', color: cores[u.tipo] || '#666' }}>
                {u.tipo === 'empresa_parceira' ? 'Empresa' : u.tipo}
              </span>
              <span style={styles.cell}>{u.curso_vinculo || u.curso || '—'}</span>
              <span style={styles.cell}>{u.matricula || '—'}</span>
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
  btn: { background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  form: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  formTitulo: { marginBottom: 16, color: '#1A1A1A' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  tabela: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  theader: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '12px 20px', background: '#F3F2F0', fontSize: 12, fontWeight: 600, color: '#666', gap: 12 },
  trow: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '14px 20px', borderTop: '1px solid #F0F0F0', gap: 12, alignItems: 'center' },
  nome: { fontWeight: 600, color: '#1A1A1A', fontSize: 14 },
  cell: { color: '#555', fontSize: 14 },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'inline-block' },
};