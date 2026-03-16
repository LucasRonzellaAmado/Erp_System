let itensOrcamento = [];

function adicionarItemOrcamento() {
    const select = document.getElementById('select_produto');
    const qtd = parseInt(document.getElementById('qtd_item').value);
    
    if (!select.value) return Swal.fire('Atenção', 'Selecione um produto', 'warning');

    const option = select.options[select.selectedIndex];
    const id = select.value;
    const nome = option.dataset.nome;
    const preco = parseFloat(option.dataset.preco);

    const index = itensOrcamento.findIndex(i => i.id === id);
    if (index > -1) {
        itensOrcamento[index].qtd += qtd;
    } else {
        itensOrcamento.push({ id, nome, preco, qtd });
    }

    renderizarTabelaOrcamento();
    select.value = '';
    document.getElementById('qtd_item').value = 1;
}

function removerItem(index) {
    itensOrcamento.splice(index, 1);
    renderizarTabelaOrcamento();
}

function renderizarTabelaOrcamento() {
    const tbody = document.querySelector('#tabela_itens_orcamento tbody');
    const descInput = document.getElementById('desconto_orcamento').value;
    const descontoPercent = parseFloat(descInput.replace(',', '.')) || 0;
    
    tbody.innerHTML = '';
    let totalBruto = 0;

    itensOrcamento.forEach((item, index) => {
        const subtotal = item.preco * item.qtd;
        totalBruto += subtotal;

        tbody.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td class="center">${item.qtd}</td>
                <td>R$ ${item.preco.toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
                <td>R$ ${subtotal.toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
                <td class="center">
                    <button class="btn-remove" onclick="removerItem(${index})">&times;</button>
                </td>
            </tr>
        `;
    });

    const valorDesconto = totalBruto * (descontoPercent / 100);
    const totalFinal = totalBruto - valorDesconto;

    document.getElementById('total_orcamento').innerText = 
        totalFinal.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function salvarOrcamento() {
    if (itensOrcamento.length === 0) return Swal.fire('Erro', 'Adicione itens ao orçamento', 'error');

    const dados = {
        id_cliente: document.getElementById('id_cliente').value,
        validade: document.getElementById('validade').value,
        desconto: document.getElementById('desconto_orcamento').value,
        condicoes: document.getElementById('condicoes').value,
        observacoes: document.getElementById('obs_orcamento').value,
        itens: itensOrcamento
    };

    fetch('api/salvar_orcamento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) {
            Swal.fire('Sucesso!', 'Orçamento gerado: #' + res.id, 'success')
                .then(() => window.location.href = 'historico_orcamentos.php');
        } else {
            Swal.fire('Erro', res.message, 'error');
        }
    });
}