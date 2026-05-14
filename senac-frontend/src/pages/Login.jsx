import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
      {/* Lado esquerdo — imagem e texto */}
      <div style={styles.left}>
        <div style={styles.leftOverlay} />
        <div style={styles.leftContent}>
          <div style={styles.logoArea}>
            <span style={styles.logoIcone}>🎓</span>
            <span style={styles.logoNome}>Senac</span>
          </div>
          <h1 style={styles.leftTitulo}>Observatório de<br />Projetos Integradores</h1>
          <p style={styles.leftDesc}>Centralize, avalie e compartilhe projetos acadêmicos de forma profissional.</p>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.titulo}>Bem-vindo de volta</h2>
          <p style={styles.subtitulo}>Entre com suas credenciais para acessar o sistema</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>E-mail</label>
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Senha</label>
              <div style={styles.senhaBox}>
                <input
                  style={{ ...styles.input, paddingRight: 40 }}
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  style={styles.olhoBtn}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {erro && <p style={styles.erro}>{erro}</p>}

            <div style={styles.rowLinks}>
              <label style={styles.lembrar}>
                <input type="checkbox" style={{ marginRight: 6 }} />
                Lembrar-me
              </label>
              <Link to="/esqueceu-senha" style={styles.linkEsqueceu}>
                Esqueceu a senha?
              </Link>
            </div>

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={styles.cadastroText}>
            Aluno novo? <Link to="/registro" style={styles.linkCadastro}>Cadastre-se aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
  },
  left: {
    flex: 1,
    backgroundImage: `url(https://otlmklanmznssostkrjb.supabase.co/storage/v1/object/public/assets/unidades-idiomas.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    padding: 40,
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    position: 'absolute',
    top: -320,
    left: 0,
  },
  logoIcone: {
    fontSize: 20,
    color: '#fff',
  },
  logoNome: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 18,
    fontFamily: 'sans-serif',
  },
  leftTitulo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 700,
    margin: '0 0 12px',
    lineHeight: 1.3,
    fontFamily: 'sans-serif',
  },
  leftDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 320,
    fontFamily: 'sans-serif',
  },
  right: {
    width: 420,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    flexShrink: 0,
  },
  formBox: {
    width: '100%',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1A1A1A',
    margin: '0 0 8px',
    fontFamily: 'sans-serif',
  },
  subtitulo: {
    color: '#666',
    fontSize: 14,
    margin: '0 0 32px',
    fontFamily: 'sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#444',
    fontFamily: 'sans-serif',
  },
  input: {
    padding: '12px 14px',
    border: '1.5px solid #E0E0E0',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'sans-serif',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    color: '#1A1A1A',
  },
  senhaBox: {
    position: 'relative',
  },
  olhoBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
  },
  rowLinks: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
  },
  lembrar: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: '#555',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  },
  linkEsqueceu: {
    color: '#E87722',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    fontFamily: 'sans-serif',
  },
  erro: {
    color: '#C8102E',
    fontSize: 13,
    margin: 0,
    fontFamily: 'sans-serif',
  },
  btn: {
    background: '#E87722',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '14px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  cadastroText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#666',
    margin: '24px 0 0',
    fontFamily: 'sans-serif',
  },
  linkCadastro: {
    color: '#E87722',
    fontWeight: 600,
    textDecoration: 'none',
  },
};