import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { path: '/', label: '🏠 Dashboard' },
    { path: '/projetos', label: '📁 Projetos' },
    { path: '/turmas', label: '🎓 Turmas' },
    ...(usuario?.tipo !== 'aluno' ? [{ path: '/usuarios', label: '👥 Usuários' }] : []),
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoText}>SENAC</span>
        <p style={styles.logoSub}>Projetos Integrados</p>
      </div>
      <div style={styles.userBox}>
        <div style={styles.avatar}>{usuario?.nome?.[0]}</div>
        <div>
          <p style={styles.userName}>{usuario?.nome}</p>
          <p style={styles.userTipo}>{usuario?.tipo}</p>
        </div>
      </div>
      <nav style={styles.nav}>
        {links.map(l => (
          <Link key={l.path} to={l.path} style={{ ...styles.link, ...(pathname === l.path ? styles.linkActive : {}) }}>
            {l.label}
          </Link>
        ))}
      </nav>
      <button style={styles.logout} onClick={handleLogout}>🚪 Sair</button>
    </div>
  );
}

const styles = {
  sidebar: { width: 220, background: '#C8102E', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 0 20px' },
  logo: { padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  logoText: { background: '#fff', color: '#C8102E', fontWeight: 700, fontSize: 20, padding: '4px 12px', borderRadius: 6, fontFamily: 'sans-serif' },
  logoSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 8, fontFamily: 'sans-serif' },
  userBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.15)' },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, fontFamily: 'sans-serif' },
  userName: { color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'sans-serif', margin: 0 },
  userTipo: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'sans-serif', margin: 0, textTransform: 'capitalize' },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  link: { display: 'block', padding: '10px 14px', borderRadius: 8, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14, fontFamily: 'sans-serif' },
  linkActive: { background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 },
  logout: { margin: '0 12px', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'sans-serif', textAlign: 'left' },
};