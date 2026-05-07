import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function EsqueceuSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await api.post('/auth/esqueceu-senha', { email });
      setEnviado(true);
    } catch {
      setErro('Email não encontrado. Verifique o endereço digitado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>SENAC</span>
          <p style={styles.logoSub}>Recuperação de Senha</p>
        </div>
        {enviado ? (
          <div style={styles.sucesso}>
            <p style={styles.sucessoTexto}>✅ Email enviado!</p>
            <p style={styles.sucessoSub}>Verifique sua caixa de entrada. Enviamos uma senha temporária para <strong>{email}</strong>.</p>
            <Link to="/login" style={styles.linkVoltar}>← Voltar para o login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={styles.instrucao}>Digite seu email cadastrado e enviaremos uma senha temporária.</p>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            {erro && <p style={styles.erro}>{erro}</p>}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar senha temporária'}
            </button>
            <p style={styles.linkText}>
              <Link to="/login" style={{ color: '#C8102E', fontWeight: 600 }}>← Voltar para o login</Link>
            </p>
          </form>
        )}
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
  instrucao: { color: '#555', fontSize: 13, marginBottom: 20, lineHeight: 1.6, fontFamily: 'sans-serif' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, fontFamily: 'sans-serif' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', outline: 'none', boxSizing: 'border-box' },
  erro: { color: '#C8102E', fontSize: 13, marginBottom: 12, fontFamily: 'sans-serif' },
  btn: { width: '100%', padding: '12px', background: '#C8102E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif', marginBottom: 12 },
  linkText: { textAlign: 'center', fontSize: 13, fontFamily: 'sans-serif', margin: 0 },
  sucesso: { textAlign: 'center' },
  sucessoTexto: { fontSize: 18, fontWeight: 700, color: '#1A7A4A', margin: '0 0 8px' },
  sucessoSub: { color: '#555', fontSize: 13, lineHeight: 1.6, fontFamily: 'sans-serif', marginBottom: 20 },
  linkVoltar: { color: '#C8102E', fontWeight: 600, fontSize: 14, fontFamily: 'sans-serif' },
};