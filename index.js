const express = require('express');
const axios = require('axios');
const qs = require('qs');
const path = require('path'); // Importar path para trabalhar com diretórios

const app = express();

// Middleware para interpretar JSON no body das requisições
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para receber o valor lido do QR Code
app.post('/api/enviar', (req, res) => {
  const { barras, cpf } = req.body;

  let data = qs.stringify({
    'barras': barras,
    'cpf': cpf,
    'tipocupom': 'rasgadinha',
    'todo': 'cadastraRasgadinha'
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://promoacipa.com.br/2024/phpScripts/exec.php',
    headers: { 
      'sec-ch-ua-platform': '"Windows"',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: data
  };

  axios.request(config)
  .then((response) => {
    res.json(response.data);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Erro ao enviar os dados');
  });
});

// Endpoint para obter os cupons
app.post('/listarCupons', (req, res) => {
  const cpf = req.body.cpf;  // O CPF virá do frontend

  
  let data = qs.stringify({
    'cpf': cpf,
    'todo': 'listarCupons'
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://promoacipa.com.br/2024/phpScripts/exec.php',
    headers: { 
      'sec-ch-ua-platform': '"Windows"',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    data: data
  };

  axios(config)
    .then((response) => {
      const html = response.data;

      // Extraindo os dados da tabela do HTML
      const cupons = extractCouponsFromHTML(html);
      res.json(cupons);  // Retornar os cupons para o frontend
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar os cupons' });
    });
});

// Função para extrair cupons do HTML
function extractCouponsFromHTML(html) {
  const regex = /<tr[^>]*>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/g;
  let matches;
  const cupons = [];

  while ((matches = regex.exec(html)) !== null) {
    cupons.push({
      nrSorte: matches[1],
      serie: matches[2],
      codBarras: matches[3],
      loja: matches[4]
    });
  }

  return cupons;
}

// Iniciar o servidor
const PORT = process.env.PORT || 2828;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
