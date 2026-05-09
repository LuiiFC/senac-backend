import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function NovaSenha() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/alterar-senha');
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Redirecionando...</p>
        <Link to="/alterar-senha" style={{ color: '#C8102E' }}>Clique aqui se não for redirecionado</Link>
      </div>
    </div>
  );
}