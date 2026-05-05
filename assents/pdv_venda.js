let itensVenda = [];

function buscarClientePorId(id) {
    const select = document.getElementById('id_cliente');
    if(id && select) select.value = id;
}

function toggleParcelas() {
    const formaSelect = document.getElementById('forma_pagamento');
    const divParcelas = document.getElementById('div_parcelas');
    if(formaSelect && divParcelas) {
        divParcelas.className = (formaSelect.value === 'Cartão Crédito') ? '' : 'hidden';
    }
}

function toggleEntregaInterface() {
    const tipoSelect = document.getElementById('tipo_venda');
    const area = document.getElementById('area_entrega');
    if (tipoSelect && area) {
        area.style.display = (tipoSelect.value === 'Entrega') ? 'block' : 'none';
    }
    recalcularPDV();
}

function adicionarItemPDV() {
    if (event) event.preventDefault();

    const select = document.getElementById('select_produto');
    const qtdInput = document.getElementById('qtd_item');
    
    if(!select || !select.value) return;

    const option = select.options[select.selectedIndex];
    const item = {
        id: select.value,
        nome: option.dataset.nome,
        preco: parseFloat(option.dataset.preco) || 0,
        qtd: parseInt(qtdInput.value) || 1
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
    const descInput = document.getElementById('desconto_geral');
    const freteInput = document.getElementById('ent_frete');
    const tipoVenda = document.getElementById('tipo_venda');
    
    const desconto = parseFloat(descInput ? descInput.value : 0) || 0;
    const frete = (tipoVenda && tipoVenda.value === 'Entrega') ? (parseFloat(freteInput ? freteInput.value : 0) || 0) : 0;
    
    let subtotal = 0;

    if(tbody) {
        tbody.innerHTML = '';
        itensVenda.forEach((item, index) => {
            const totalItem = item.preco * item.qtd;
            subtotal += totalItem;
            tbody.innerHTML += `
                <tr>
                    <td>${item.nome}</td>
                    <td class="center">${item.qtd}</td>
                    <td>R$ ${item.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td>R$ ${totalItem.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td class="center">
                        <button type="button" class="btn-remove-item" onclick="removerItemPDV(${index})">×</button>
                    </td>
                </tr>
            `;
        });
    }

    const totalFinal = Math.max(0, (subtotal + frete) - desconto);
    
    const resSubtotal = document.getElementById('res_subtotal');
    const totalExibicao = document.getElementById('total_final_exibicao');

    if(resSubtotal) resSubtotal.innerText = `R$ ${subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if(totalExibicao) {
        totalExibicao.innerText = `R$ ${totalFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        totalExibicao.dataset.valor = totalFinal;
    }
}

function removerItemPDV(index) {
    itensVenda.splice(index, 1);
    recalcularPDV();
}

function finalizarVendaPDV() {
    const elementoTotal = document.getElementById('total_final_exibicao');
    if(!elementoTotal) return;

    // Lê o total do data-valor (número puro, sem formatação)
    const totalFinal = parseFloat(elementoTotal.dataset.valor) || 0;

    if (itensVenda.length === 0) {
        Swal.fire('Atenção', 'Adicione produtos ao carrinho antes de finalizar.', 'warning');
        return;
    }

    const idCliente = document.getElementById('id_cliente')?.value || '1';
    const formaPgto = document.getElementById('forma_pagamento')?.value || 'Dinheiro';
    const tipoVenda = document.getElementById('tipo_venda')?.value || 'Local';
    const desconto = parseFloat(document.getElementById('desconto_geral')?.value || 0) || 0;
    const emitirNota = document.getElementById('emitir_nota')?.checked ? 1 : 0;

    const dados = {
        id_cliente: idCliente,
        forma_pagamento: formaPgto,
        tipo_venda: tipoVenda,
        total: totalFinal,
        desconto: desconto,
        itens: itensVenda,
        gerar_nf: emitirNota,
        entrega: {
            rua: document.getElementById('ent_logradouro')?.value || '',
            num: document.getElementById('ent_numero')?.value || '',
            bairro: document.getElementById('ent_bairro')?.value || '',
            frete: parseFloat(document.getElementById('ent_frete')?.value || 0) || 0
        }
    };

    fetch('/erp/action/processa_venda.php', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (!response.ok) throw new Error('Caminho não encontrado ou erro no servidor.');
        return response.json();
    })
    .then(data => {
        if (data.sucesso) {
            Swal.fire('Sucesso!', 'Venda finalizada.', 'success').then(() => location.reload());
        } else {
            Swal.fire('Erro', data.mensagem || 'Erro ao processar', 'error');
        }
    })
    .catch(error => {
        console.error('Erro detalhado:', error);
        Swal.fire('Erro Crítico', 'Não foi possível falar com o servidor. Verifique o arquivo processa_venda.php', 'error');
    });
}