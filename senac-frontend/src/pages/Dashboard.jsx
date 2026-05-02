import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ usuarios: 0, projetos: 0, turmas: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/usuarios'),
      api.get('/projetos'),
      api.get('/turmas'),
    ]).then(([u, p, t]) => {
      setStats({ usuarios: u.data.length, projetos: p.data.length, turmas: t.data.length });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Usuários', valor: stats.usuarios, cor: '#1565C0', emoji: '👥' },
    { label: 'Projetos', valor: stats.projetos, cor: '#1A7A4A', emoji: '📁' },
    { label: 'Turmas', valor: stats.turmas, cor: '#B45309', emoji: '🎓' },
  ];

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.titulo}>Dashboard</h1>
        <p style={styles.sub}>Bem-vindo ao Sistema de Projetos Integrados do Senac</p>
        <div style={styles.grid}>
          {cards.map(c => (
            <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.cor}` }}>
              <span style={styles.emoji}>{c.emoji}</span>
              <p style={styles.valor}>{c.valor}</p>
              <p style={styles.cardLabel}>{c.label}</p>
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
  titulo: { fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 },
  sub: { color: '#666', marginTop: 8, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  emoji: { fontSize: 32 },
  valor: { fontSize: 40, fontWeight: 700, margin: '8px 0 4px', color: '#1A1A1A' },
  cardLabel: { color: '#666', fontSize: 14, margin: 0 },
};