import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch {
      setErro('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>SENAC</span>
          <p style={styles.logoSub}>Sistema de Projetos Integrados</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input style={styles.input} type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          {erro && <p style={styles.erro}>{erro}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p style={styles.linkText}>
            <Link to="/esqueceu-senha" style={{ color: '#888', fontSize: 13, fontFamily: 'sans-serif' }}>
              Esqueceu sua senha?
            </Link>
          </p>
          <p style={styles.linkText}>
            Aluno? <Link to="/registro" style={{ color: '#C8102E', fontWeight: 600 }}>Cadastre-se aqui</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  logo: { textAlign: 'center', marginBottom: 32 },
  logoText: { background: '#C8102E', color: '#fff', fontWeight: 700, fontSize: 28, padding: '6px 20px', borderRadius: 8, fontFamily: 'sans-serif' },
  logoSub: { color: '#666', fontSize: 13, marginTop: 10, fontFamily: 'sans-serif' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, fontFamily: 'sans-serif' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', outline: 'none', boxSizing: 'border-box' },
  erro: { color: '#C8102E', fontSize: 13, marginBottom: 12, fontFamily: 'sans-serif' },
  btn: { width: '100%', padding: '12px', background: '#C8102E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif', marginBottom: 12 },
  linkText: { textAlign: 'center', fontSize: 13, fontFamily: 'sans-serif', color: '#666', margin: '8px 0 0' },
};