import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://otlmklanmznssostkrjb.supabase.co',
  'sb_publishable_SDIHfw1YlFdVrEFVqTsXMQ_eVHl3aCG'
);

export default function NovaSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (senha !== confirmar) {
      setErro('As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      alert('Senha atualizada com sucesso!');
      navigate('/login');
    } catch {
      setErro('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>SENAC</span>
          <p style={styles.logoSub}>Nova Senha</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nova senha</label>
            <input style={styles.input} type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirmar senha</label>
            <input style={styles.input} type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="••••••••" required />
          </div>
          {erro && <p style={styles.erro}>{erro}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  logo: { textAlign: 'center', marginBottom: 24 },
  logoText: { background: '#C8102E', color: '#fff', fontWeight: 700, fontSize: 28, padding: '6px 20px', borderRadius: 8, fontFamily: 'sans-serif' },
  logoSub: { color: '#666', fontSize: 13, marginTop: 8, fontFamily: 'sans-serif' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, fontFamily: 'sans-serif' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', outline: 'none', boxSizing: 'border-box' },
  erro: { color: '#C8102E', fontSize: 13, marginBottom: 12, fontFamily: 'sans-serif' },
  btn: { width: '100%', padding: '12px', background: '#C8102E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif' },
};