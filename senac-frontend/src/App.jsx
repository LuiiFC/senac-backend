import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import EsqueceuSenha from './pages/EsqueceuSenha';
import NovaSenha from './pages/NovaSenha';
import Dashboard from './pages/Dashboard';
import Projetos from './pages/Projetos';
import ProjetoDetalhe from './pages/ProjetoDetalhe';
import Usuarios from './pages/Usuarios';
import Turmas from './pages/Turmas';
import AlterarSenha from './pages/AlterarSenha';
// dentro das Routes:
<Route path="/alterar-senha" element={<Privado><AlterarSenha /></Privado>} />
function Privado({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route path="/" element={<Privado><Dashboard /></Privado>} />
          <Route path="/projetos" element={<Privado><Projetos /></Privado>} />
          <Route path="/projetos/:id" element={<Privado><ProjetoDetalhe /></Privado>} />
          <Route path="/usuarios" element={<Privado><Usuarios /></Privado>} />
          <Route path="/turmas" element={<Privado><Turmas /></Privado>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}