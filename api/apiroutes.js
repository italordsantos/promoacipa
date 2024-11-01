const express = require('express');
const axios = require('axios');
const qs = require('qs');

const router = express.Router();

router.get('/enviar', (req, res) => {
  res.send("opa :D");
});

// Rota para receber o valor lido do QR Code
router.post('/api/enviar', (req, res) => {
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
router.post('/api/listarCupons', (req, res) => {
  const cpf = req.body.cpf;

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
      const cupons = extractCouponsFromHTML(html);
      res.json(cupons);
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

module.exports = router;
