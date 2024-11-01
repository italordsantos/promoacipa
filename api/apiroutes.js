const axios = require("axios");
const qs = require("qs");

module.exports = async (req, res) => {
  if (req.method === "GET" && req.url === "/api/enviar") {
    return res.json({ message: "opa :D" });
  }

  if (req.method === "POST" && req.url === "/api/enviar") {
    const { barras, cpf } = req.body;

    const data = qs.stringify({
      barras: barras,
      cpf: cpf,
      tipocupom: "rasgadinha",
      todo: "cadastraRasgadinha",
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://promoacipa.com.br/2024/phpScripts/exec.php",
      headers: {
        "sec-ch-ua-platform": '"Windows"',
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      return res.json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Erro ao enviar os dados");
    }
  }

  if (req.method === "POST" && req.url === "/api/listarCupons") {
    const { cpf } = req.body;

    const data = qs.stringify({
      cpf: cpf,
      todo: "listarCupons",
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://promoacipa.com.br/2024/phpScripts/exec.php",
      headers: {
        "sec-ch-ua-platform": '"Windows"',
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      data: data,
    };

    try {
      const response = await axios(config);
      const html = response.data;
      const cupons = extractCouponsFromHTML(html);
      return res.json(cupons);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar os cupons" });
    }
  }

  return res.status(405).send("Método não permitido");
};

// Função para extrair cupons do HTML
function extractCouponsFromHTML(html) {
  const regex =
    /<tr[^>]*>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/g;
  let matches;
  const cupons = [];

  while ((matches = regex.exec(html)) !== null) {
    cupons.push({
      nrSorte: matches[1],
      serie: matches[2],
      codBarras: matches[3],
      loja: matches[4],
    });
  }

  return cupons;
}
