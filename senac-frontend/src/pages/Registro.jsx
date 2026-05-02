import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

export default function Registro() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', matricula: '', curso: '', turma_id: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

useEffect(() => {
  api.get('/turmas/publicas').then(r => setTurmas(r.data)).catch(() => {});
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/auth/registrar', form);
      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>SENAC</span>
          <p style={styles.logoSub}>Cadastro de Aluno</p>
        </div>
        {sucesso ? (
          <div style={styles.sucesso}>✅ Cadastro realizado! Aguarde aprovação do professor.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {[
              { key: 'nome', label: 'Nome completo', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'senha', label: 'Senha', type: 'password' },
              { key: 'matricula', label: 'Matrícula', type: 'text' },
              { key: 'curso', label: 'Curso', type: 'text' },
            ].map(f => (
              <div key={f.key} style={styles.field}>
                <label style={styles.label}>{f.label}</label>
                <input style={styles.input} type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required />
              </div>
            ))}
            <div style={styles.field}>
              <label style={styles.label}>Turma</label>
              <select style={styles.input} value={form.turma_id} onChange={e => setForm({...form, turma_id: e.target.value})}>
                <option value="">Selecione sua turma...</option>
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} — {t.curso}</option>)}
              </select>
            </div>
            {erro && <p style={styles.erro}>{erro}</p>}
            <button style={styles.btn} type="submit">Cadastrar</button>
            <p style={styles.linkText}>Já tem conta? <Link to="/login" style={{ color: '#C8102E', fontWeight: 600 }}>Entrar</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  logo: { textAlign: 'center', marginBottom: 24 },
  logoText: { background: '#C8102E', color: '#fff', fontWeight: 700, fontSize: 28, padding: '6px 20px', borderRadius: 8, fontFamily: 'sans-serif' },
  logoSub: { color: '#666', fontSize: 13, marginTop: 8, fontFamily: 'sans-serif' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 4, fontFamily: 'sans-serif' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', boxSizing: 'border-box' },
  erro: { color: '#C8102E', fontSize: 13, marginBottom: 10, fontFamily: 'sans-serif' },
  sucesso: { background: '#E8F5EE', color: '#1A7A4A', padding: 16, borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', textAlign: 'center' },
  btn: { width: '100%', padding: '11px', background: '#C8102E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif', marginBottom: 12 },
  linkText: { textAlign: 'center', fontSize: 13, fontFamily: 'sans-serif', color: '#666', margin: 0 },
};