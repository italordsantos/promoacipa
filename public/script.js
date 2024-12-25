// Lista para armazenar códigos já lidos
let codigosEnviados = new Set();
let oldDecodedText = "";

document.getElementById('clienteCPF').addEventListener('input', function () {
    const cpfInput = this.value;

    // Remover caracteres não numéricos
    const cpfLimpo = cpfInput.replace(/\D/g, '');

    // Verificar se o CPF contém 11 dígitos
    if (cpfLimpo.length === 11) {
        console.log('CPF completo:', cpfLimpo);
        consultarCupons(cpfLimpo); // Disparar a função de consulta de cupons com o CPF
    }
});

function consultarCupons() {
    const clienteCPF = document.getElementById('clienteCPF').value;
    if (clienteCPF && clienteCPF != '') {
        fetch('/listarCupons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cpf: clienteCPF }),  // Enviar o CPF lido
        })
            .then(response => response.json())
            .then(cupons => {
                console.log("Cupons recebidos:", cupons);
                // Limpar a tabela
                const tableBody = document.querySelector('#cupons-table tbody');
                tableBody.innerHTML = '';

                // Popular a tabela com os cupons recebidos
                cupons.forEach(cupom => {
                    const row = `<tr>
                            <td>${cupom.nrSorte}</td>
                            <td>${cupom.serie}</td>
                            <td>${cupom.codBarras}</td>
                            <td>${cupom.loja}</td>
                         </tr>`;
                    tableBody.innerHTML += row;
                    if (!codigosEnviados.has(cupom.codBarras)) {
                        codigosEnviados.add(cupom.codBarras);
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao consultar cupons:', error);
            });
    }
}

function onScanSuccess(decodedText, decodedResult) {
    const clienteCPF = document.getElementById('clienteCPF').value;

    if (clienteCPF && clienteCPF != '') {
        if (oldDecodedText != decodedText) {
            oldDecodedText = decodedText

            // Verificando o status retornado
            const resultadoFormatado = document.getElementById('resultadoFormatado');
            const resultadoRaw = document.getElementById('resultadoRaw');

            // Verifica se o código já foi lido
            if (codigosEnviados.has(decodedText)) {
                console.log(`Código ${decodedText} já enviado. Ignorando nova leitura.`);
                resultadoFormatado.textContent = `Cupom ${decodedText}: já está cadastrado.`;
                resultadoRaw.textContent = ``; // Exibir dados brutos

                return;
            }

            // Adiciona o código à lista de enviados
            codigosEnviados.add(decodedText);

            console.log(`Novo código lido: ${decodedText}`);

            // Enviar o valor lido do QR Code para o backend
            fetch('/api/enviar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    barras: decodedText,
                    cpf: clienteCPF
                })
            })
                .then(response => response.json())
                .then(data => {
                    // Atualizando os textos baseados no status
                    if (data.status === 2) {
                        resultadoFormatado.textContent = `Cupom ${decodedText}: já está cadastrado.`;
                        resultadoRaw.textContent = `Raw Data: ${JSON.stringify(data)}`; // Exibir dados brutos
                    } else if (data.status === 1) {
                        resultadoFormatado.textContent = `Cupom ${decodedText}: Parabéns! Você foi premiado!`;
                        resultadoRaw.textContent = `Raw Data: ${JSON.stringify(data)}`; // Exibir dados brutos
                    } else if (data.status === 0) {
                        resultadoFormatado.textContent = `Cupom ${decodedText}: ops! Não foi desta vez`;
                        resultadoRaw.textContent = `Raw Data: ${JSON.stringify(data)}`; // Exibir dados brutos
                    } else {
                        resultadoFormatado.textContent = `Cupom ${decodedText}: Status desconhecido.`;
                        resultadoRaw.textContent = `Raw Data: ${JSON.stringify(data)}`; // Exibir dados brutos
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    const resultadoFormatado = document.getElementById('resultadoFormatado');
                    resultadoFormatado.textContent = "Ocorreu um erro ao processar a requisição.";
                });

            consultarCupons()
        }
    }
}

var html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
