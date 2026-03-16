let itensVenda = [];

function buscarClientePorId(id) {
    const select = document.getElementById('id_cliente');
    if(id) select.value = id;
}

function toggleParcelas() {
    const forma = document.getElementById('forma_pagamento').value;
    document.getElementById('div_parcelas').className = (forma === 'Cartão Crédito') ? '' : 'hidden';
}

function adicionarItemPDV() {
    const select = document.getElementById('select_produto');
    const qtdInput = document.getElementById('qtd_item');
    
    if(!select.value) return;

    const option = select.options[select.selectedIndex];
    const item = {
        id: select.value,
        nome: option.dataset.nome,
        preco: parseFloat(option.dataset.preco),
        qtd: parseInt(qtdInput.value)
    };

    const index = itensVenda.findIndex(i => i.id === item.id);
    if(index > -1) {
        itensVenda[index].qtd += item.qtd;
    } else {
        itensVenda.push(item);
    }

    select.value = "";
    qtdInput.value = 1;
    recalcularPDV();
}

function recalcularPDV() {
    const tbody = document.querySelector('#tabela_itens_venda tbody');
    const desconto = parseFloat(document.getElementById('desconto_geral').value) || 0;
    let subtotal = 0;

    tbody.innerHTML = '';
    itensVenda.forEach((item, index) => {
        const totalItem = item.preco * item.qtd;
        subtotal += totalItem;
        tbody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td class="center">${item.qtd}</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td>R$ ${totalItem.toFixed(2)}</td>
                <td class="center"><button class="btn-remove-item" onclick="removerItemPDV(${index})">×</button></td>
            </tr>
        `;
    });

    const totalFinal = Math.max(0, subtotal - desconto);
    document.getElementById('res_subtotal').innerText = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('total_final_exibicao').innerText = `R$ ${totalFinal.toFixed(2)}`;
}

function removerItemPDV(index) {
    itensVenda.splice(index, 1);
    recalcularPDV();
}

function finalizarVendaPDV() {
    const elementoTotal = document.getElementById('total_final_exibicao');
    const totalFinal = parseFloat(
        elementoTotal.innerText
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .trim()
    ) || 0;

    if (typeof itensVenda === 'undefined' || itensVenda.length === 0) {
        Swal.fire('Atenção', 'Adicione produtos ao carrinho antes de finalizar.', 'warning');
        return;
    }

    const emitirNota = document.getElementById('emitir_nota').checked ? 1 : 0;
    const idCliente = document.getElementById('id_cliente').value;
    const formaPgto = document.getElementById('forma_pagamento').value;
    const desconto = parseFloat(document.getElementById('desconto_geral').value) || 0;

    const dados = {
        id_cliente: idCliente,
        forma_pagamento: formaPgto,
        total: totalFinal,
        desconto: desconto,
        itens: itensVenda,
        gerar_nf: emitirNota
    };

    fetch('action/processar_venda.php', { // Verifique se não falta o "s" em "actions"
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
    .then(response => {
        // Isso aqui vai nos dizer exatamente o que o PHP respondeu se der erro
        if (!response.ok) {
            throw new Error('Caminho não encontrado (404) ou erro no servidor.');
        }
        return response.json();
    })
    .then(data => {
        if (data.sucesso) { // Mudei para 'sucesso' para bater com seu PHP
            Swal.fire('Sucesso!', 'Venda finalizada.', 'success').then(() => location.reload());
        } else {
            Swal.fire('Erro', data.mensagem, 'error');
        }
    })
    .catch(error => {
        console.error('Erro detalhado:', error);
        Swal.fire('Erro Crítico', 'O arquivo action/processr_venda.php não foi encontrado ou o PHP falhou.', 'error');
    });
}