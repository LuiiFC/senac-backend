import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

export default function Turmas() {
  const { usuario } = useAuth();
  const [turmas, setTurmas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [alunosSemTurma, setAlunosSemTurma] = useState([]);
  const [form, setForm] = useState({ nome: '', curso: '', ano: '', semestre: '1', coordenador_id: '' });
  const [mostrarForm, setMostrarForm] = useState(false);
  const [turmaExpandida, setTurmaExpandida] = useState(null);
  const [matriculas, setMatriculas] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState('');

  const carregar = async () => {
    const [turmasRes, usuariosRes] = await Promise.all([
      api.get('/turmas'),
      api.get('/usuarios'),
    ]);
    setTurmas(turmasRes.data);
    setUsuarios(usuariosRes.data.filter(u => u.tipo === 'coordenador'));

    const alunos = usuariosRes.data.filter(u => u.tipo === 'aluno');
    try {
      const matriculasRes = await api.get('/turmas/matriculas/todas');
      const alunosComTurma = matriculasRes.data.map(m => m.aluno_id);
      setAlunosSemTurma(alunos.filter(a => !alunosComTurma.includes(a.id)));
    } catch {
      setAlunosSemTurma(alunos);
    }
  };

 useEffect(() => {
    const init = async () => { await carregar(); };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/turmas', { ...form, ano: parseInt(form.ano), semestre: parseInt(form.semestre) });
    setMostrarForm(false);
    carregar();
  };

  const expandirTurma = async (turma_id) => {
    if (turmaExpandida === turma_id) { setTurmaExpandida(null); return; }
    setTurmaExpandida(turma_id);
    const res = await api.get(`/turmas/${turma_id}/matriculas`);
    setMatriculas(res.data);
  };

  const adicionarAluno = async (turma_id) => {
    if (!alunoSelecionado) return;
    await api.post(`/turmas/${turma_id}/matriculas`, { aluno_id: alunoSelecionado });
    setAlunoSelecionado('');
    const res = await api.get(`/turmas/${turma_id}/matriculas`);
    setMatriculas(res.data);
    carregar();
  };

  const aprovarMatricula = async (matricula_id, turma_id) => {
    await api.patch(`/turmas/matriculas/${matricula_id}/aprovar`);
    const res = await api.get(`/turmas/${turma_id}/matriculas`);
    setMatriculas(res.data);
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.titulo}>Turmas</h1>
          {usuario?.tipo === 'coordenador' && (
            <button style={styles.btn} onClick={() => setMostrarForm(!mostrarForm)}>+ Nova Turma</button>
          )}
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={{ marginBottom: 16 }}>Cadastrar Turma</h3>
            <div style={styles.grid}>
              <div><label style={styles.label}>Nome</label><input style={styles.input} value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></div>
              <div><label style={styles.label}>Curso</label><input style={styles.input} value={form.curso} onChange={e => setForm({...form, curso: e.target.value})} required /></div>
              <div><label style={styles.label}>Ano</label><input style={styles.input} type="number" value={form.ano} onChange={e => setForm({...form, ano: e.target.value})} required /></div>
              <div>
                <label style={styles.label}>Semestre</label>
                <select style={styles.input} value={form.semestre} onChange={e => setForm({...form, semestre: e.target.value})}>
                  <option value="1">1º Semestre</option>
                  <option value="2">2º Semestre</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Coordenador</label>
                <select style={styles.input} value={form.coordenador_id} onChange={e => setForm({...form, coordenador_id: e.target.value})}>
                  <option value="">Selecione...</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
            </div>
            <button style={styles.btn} type="submit">Salvar</button>
          </form>
        )}

        {alunosSemTurma.length > 0 && usuario?.tipo !== 'aluno' && (
          <div style={styles.alertBox}>
            <p style={styles.alertTitulo}>⚠️ Alunos sem turma ({alunosSemTurma.length})</p>
            <p style={styles.alertSub}>Expanda uma turma abaixo para adicionar esses alunos</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {alunosSemTurma.map(a => (
                <span key={a.id} style={styles.alunoTag}>{a.nome}</span>
              ))}
            </div>
          </div>
        )}

        <div style={styles.cards}>
          {turmas.map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={styles.cardNome}>{t.nome}</p>
                  <p style={styles.cardCurso}>{t.curso}</p>
                  <p style={styles.cardInfo}>📅 {t.ano} — {t.semestre}º Semestre</p>
                  {t.usuarios && <p style={styles.cardInfo}>👤 {t.usuarios.nome}</p>}
                </div>
                {usuario?.tipo !== 'aluno' && (
                  <button style={styles.btnExpand} onClick={() => expandirTurma(t.id)}>
                    {turmaExpandida === t.id ? '▲ Fechar' : '▼ Gerenciar'}
                  </button>
                )}
              </div>

              {turmaExpandida === t.id && (
                <div style={styles.expandBox}>
                  <p style={styles.expandTitulo}>👥 Alunos da turma</p>

                  <div style={styles.addAlunoBox}>
                    <select style={{ ...styles.input, flex: 1 }} value={alunoSelecionado} onChange={e => setAlunoSelecionado(e.target.value)}>
                      <option value="">Selecione um aluno para adicionar...</option>
                      {alunosSemTurma.map(a => <option key={a.id} value={a.id}>{a.nome} — {a.curso || 'sem curso'}</option>)}
                    </select>
                    <button style={styles.btn} onClick={() => adicionarAluno(t.id)}>+ Adicionar</button>
                  </div>

                  {matriculas.length === 0 ? (
                    <p style={styles.vazio}>Nenhum aluno nesta turma ainda.</p>
                  ) : (
                    matriculas.map(m => (
                      <div key={m.id} style={styles.alunoRow}>
                        <span style={styles.alunoNome}>{m.usuarios?.nome}</span>
                        <span style={styles.alunoEmail}>{m.usuarios?.email}</span>
                        {m.aprovado ? (
                          <span style={styles.aprovado}>✅ Aprovado</span>
                        ) : (
                          <button style={styles.btnAprovar} onClick={() => aprovarMatricula(m.id, t.id)}>Aprovar</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  alertBox: { background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12, padding: 16, marginBottom: 24 },
  alertTitulo: { fontWeight: 700, color: '#B45309', margin: '0 0 4px' },
  alertSub: { color: '#92400E', fontSize: 13, margin: 0 },
  alunoTag: { background: '#FDE68A', color: '#92400E', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  cards: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid #FF6B35' },
  cardNome: { fontWeight: 700, fontSize: 16, color: '#1A1A1A', margin: '0 0 4px' },
  cardCurso: { color: '#FF6B35', fontSize: 13, fontWeight: 600, margin: '0 0 8px' },
  cardInfo: { color: '#666', fontSize: 13, margin: '4px 0' },
  btnExpand: { background: '#F3F2F0', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#555' },
  expandBox: { marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F0F0' },
  expandTitulo: { fontWeight: 700, fontSize: 14, color: '#1A1A1A', marginBottom: 12 },
  addAlunoBox: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' },
  alunoRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #F5F5F5' },
  alunoNome: { fontWeight: 600, fontSize: 14, color: '#1A1A1A', flex: 1 },
  alunoEmail: { color: '#888', fontSize: 13, flex: 1 },
  aprovado: { color: '#1A7A4A', fontSize: 13, fontWeight: 600 },
  btnAprovar: { background: '#1A7A4A', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  vazio: { color: '#999', fontSize: 13, textAlign: 'center', padding: '16px 0' },
};