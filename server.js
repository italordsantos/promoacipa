const express = require('express');
const path = require('path');
const apiRoutes = require('./api/apiroutes'); // Importa as rotas da API

const app = express();

// Middleware para interpretar JSON no body das requisições
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Usar as rotas de API definidas em `apiRoutes.js`
app.use('/api', apiRoutes);

// Iniciar o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
