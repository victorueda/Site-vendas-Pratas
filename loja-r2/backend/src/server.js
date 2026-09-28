const path = require('path');
const express = require('express');
const { notFound, errorHandler } = require('./middleware/errors');

require('./db'); // abre o banco e cria as tabelas se ainda não existirem

const app = express();
app.use(express.json({ limit: '50kb' }));

// API
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api', notFound);

// Frontend (mesma origem da API: não precisa configurar CORS)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Loja rodando em http://localhost:${PORT}`));
