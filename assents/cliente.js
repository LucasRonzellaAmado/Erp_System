const inputSearch = document.getElementById('smart_search');
const resultsDiv = document.getElementById('search_results');

inputSearch.addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    resultsDiv.innerHTML = '';
    if (termo.length < 1) { resultsDiv.style.display = 'none'; return; }

    const filtrados = listaClientes.filter(c => c.nome.toLowerCase().includes(termo) || c.id.toString().includes(termo));

    if (filtrados.length > 0) {
        filtrados.forEach(c => {
            const item = document.createElement('div');
            item.className = 'search-item';
            item.innerHTML = `<span>${c.nome}</span> <b>#${c.id}</b>`;
            item.onclick = () => {
                inputSearch.value = `${c.nome} (#${c.id})`;
                resultsDiv.style.display = 'none';
                carregarHistorico(c.id);
            };
            resultsDiv.appendChild(item);
        });
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.style.display = 'none';
    }
});

function carregarHistorico(idCliente) {
    const corpo = document.getElementById('corpo_historico');
    corpo.innerHTML = "<tr><td colspan='7' style='text-align:center;'>🔄 Carregando dados...</td></tr>";

    fetch(`api/get_historico.php?id_cliente=${idCliente}`)
        .then(response => response.json())
        .then(vendas => {
            corpo.innerHTML = "";
            if (vendas.length === 0) {
                corpo.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Nenhuma venda encontrada.</td></tr>";
                return;
            }
            vendas.forEach(v => {
                const valorUnitario = parseFloat(v.valor_venda || 0);
                const qtd = parseFloat(v.quantidade || 0);
                const subtotal = valorUnitario * qtd;
                
                corpo.innerHTML += `
                    <tr>
                        <td>${v.data_venda || '---'}</td>
                        <td>${v.nome_produto}</td>
                        <td>${qtd}</td>
                        <td>R$ ${valorUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td><span class="badge-pgto">${v.metodo_pagamento || 'DINHEIRO'}</span></td>
                        <td>
                            <button class="btn-action btn-view" onclick="verDetalhes('${v.id}', '${v.nome_produto}', '${qtd}', '${valorUnitario}', '${v.data_venda}')">👁️</button>
                            <button class="btn-action btn-print" onclick="imprimirVenda('${v.id}')">🖨️</button>
                        </td>
                    </tr>`;
            });
        }).catch(() => {
            corpo.innerHTML = "<tr><td colspan='7' class='txt-red'>❌ Erro de conexão.</td></tr>";
        });
}

function verDetalhes(id, produto, qtd, valor, data) {
    const total = parseFloat(qtd) * parseFloat(valor);
    Swal.fire({
        title: `Detalhes da Venda #${id}`,
        html: `<div style="text-align: left; line-height: 2;"><hr>
                <b>Data:</b> ${data}<br><b>Produto:</b> ${produto}<br>
                <b>Quantidade:</b> ${qtd}<br><b>Valor Unit.:</b> R$ ${parseFloat(valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}<br>
                <b style="color: #2563eb; font-size: 1.2em;">Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</b></div>`,
        icon: 'info', confirmButtonColor: '#2563eb'
    });
}

function imprimirVenda(idVenda) {
    if(!idVenda) return;
    window.open(`imprimir_cupom.php?id=${idVenda}`, '_blank');
}

function toggleCard(id, iconId) {
    const el = document.getElementById(id);
    const icon = document.getElementById(iconId);
    const txt = document.getElementById('txt_botao');
    el.classList.toggle('collapsed');
    icon.classList.toggle('rotate');
    txt.innerText = el.classList.contains('collapsed') ? "CLIQUE PARA ABRIR" : "RECOLHER FORMULÁRIO";
}

function toggleCampos(tipo) {
    const boxFantasia = document.getElementById('box_fantasia');
    const labelNome = document.getElementById('label_nome');
    const labelDoc = document.getElementById('label_doc');

    if(tipo === 'PJ') {
        boxFantasia.style.display = 'flex';
        labelNome.innerText = 'Razão Social';
        labelDoc.innerText = 'CNPJ';
    } else {
        boxFantasia.style.display = 'none';
        labelNome.innerText = 'Nome Completo';
        labelDoc.innerText = 'CPF';
    }
}

function toggleLimite(v) {
    const inp = document.getElementById('limite_credito');
    if(v == "0") { inp.value = "ILIMITADO"; inp.readOnly = true; }
    else { inp.value = "0,00"; inp.readOnly = false; }
}

function buscaCEP(cep) {
    fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
    .then(r => r.json()).then(d => {
        if(!d.erro) {
            document.getElementById('logradouro').value = d.logradouro;
            document.getElementById('bairro').value = d.bairro;
            document.getElementById('cidade').value = d.localidade;
            document.getElementById('uf').value = d.uf;
        }
    });
}

function confirmarCadastro(id, nome) {
    Swal.fire({
        title: '✅ Cliente Cadastrado!',
        html: `<div class="swal-custom-box"><b>ID:</b> #${id}<br><b>Nome:</b> ${nome}</div>`,
        icon: 'success', confirmButtonColor: '#2563eb'
    }).then(() => { window.location='cliente.php'; });
}

document.querySelectorAll('.money-mask').forEach(input => {
    input.addEventListener('input', function() {
        let v = this.value.replace(/\D/g, "");
        v = (parseFloat(v) / 100).toFixed(2).replace(".", ",");
        this.value = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    });
});

document.addEventListener('click', (e) => { if (!inputSearch.contains(e.target)) resultsDiv.style.display = 'none'; });