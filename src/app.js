const express = require('express');
const cors = require('cors');
const app = express();
const turmaCtrl = require('./controllers/turmaController');

app.use(cors({
  origin: ['https://senac-frontend.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rotas públicas e especiais
app.get('/api/turmas/publicas', turmaCtrl.listarPublicas);
app.get('/api/turmas/matriculas/todas', turmaCtrl.listarTodasMatriculas);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/turmas', require('./routes/turmas'));
app.use('/api/projetos', require('./routes/projetos'));
app.use('/api/avaliacoes', require('./routes/avaliacoes'));

module.exports = app;