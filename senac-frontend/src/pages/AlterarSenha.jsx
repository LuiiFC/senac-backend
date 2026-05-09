import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

export default function AlterarSenha() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (form.novaSenha !== form.confirmar) {
      setErro('As senhas não coincidem');
      return;
    }
    if (form.novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/alterar-senha', {
        senhaAtual: form.senhaAtual,
        novaSenha: form.novaSenha,
      });
      setSucesso(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.titulo}>🔒 Alterar Senha</h1>
          <p style={styles.sub}>Por segurança, recomendamos alterar a senha temporária.</p>

          {sucesso ? (
            <div style={styles.sucesso}>
              ✅ Senha alterada com sucesso! Redirecionando...
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Senha atual</label>
                <input style={styles.input} type="password" value={form.senhaAtual} onChange={e => setForm({...form, senhaAtual: e.target.value})} placeholder="••••••••" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Nova senha</label>
                <input style={styles.input} type="password" value={form.novaSenha} onChange={e => setForm({...form, novaSenha: e.target.value})} placeholder="••••••••" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirmar nova senha</label>
                <input style={styles.input} type="password" value={form.confirmar} onChange={e => setForm({...form, confirmar: e.target.value})} placeholder="••••••••" required />
              </div>
              {erro && <p style={styles.erro}>{erro}</p>}
              <button style={styles.btn} type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  main: { flex: 1, padding: 40, background: '#F8F7F5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 480, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 40 },
  titulo: { fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' },
  sub: { color: '#666', fontSize: 14, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 13, fontWeight: 600, color: '#333' },
  input: { padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  erro: { color: '#C8102E', fontSize: 13, margin: 0 },
  btn: { padding: '12px', background: '#C8102E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  sucesso: { background: '#E8F5EE', color: '#1A7A4A', padding: 16, borderRadius: 8, fontSize: 14, textAlign: 'center' },
};