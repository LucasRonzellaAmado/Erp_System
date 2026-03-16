let pedido = [];

function carregarProdutosFornecedor(id_fornecedor) {
    const tbody = document.getElementById('lista_produtos_fornecedor');
    
    if(!id_fornecedor) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Aguardando seleção de fornecedor...</td></tr>';
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Carregando produtos...</td></tr>';

    fetch(`api/get_produtos_fornecedor.php?id=${id_fornecedor}`)
    .then(r => r.json())
    .then(produtos => {
        tbody.innerHTML = '';
        if(produtos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state" style="color:#ef4444">Nenhum produto vinculado.</td></tr>';
            return;
        }

        produtos.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${p.nome}</strong></td>
                    <td class="center">${p.quantidade}</td>
                    <td>R$ ${parseFloat(p.preco_custo).toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
                    <td class="center"><input type="number" id="qtd_${p.id}" value="1" min="1" class="input-qtd"></td>
                    <td><button class="btn-add" onclick="addAoPedido(${p.id}, '${p.nome}', ${p.preco_custo})">ADICIONAR</button></td>
                </tr>
            `;
        });
    })
    .catch(err => {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color:red">Erro ao carregar dados.</td></tr>`;
    });
}

function addAoPedido(id, nome, preco) {
    const qtd = parseInt(document.getElementById('qtd_'+id).value);
    const index = pedido.findIndex(item => item.id === id);
    
    if (index !== -1) {
        pedido[index].qtd += qtd;
    } else {
        pedido.push({ id, nome, preco: parseFloat(preco), qtd });
    }
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const tbody = document.getElementById('itens_carrinho');
    let total = 0;
    tbody.innerHTML = '';
    
    pedido.forEach((item, index) => {
        const sub = item.preco * item.qtd;
        total += sub;
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.nome}</strong><br><small>${item.qtd}un x R$ ${item.preco.toFixed(2)}</small></td>
                <td style="text-align:right; font-weight:600;">R$ ${sub.toFixed(2)}</td>
                <td style="text-align:right; width:30px;">
                    <button class="btn-del" onclick="pedido.splice(${index},1); renderizarCarrinho()">✕</button>
                </td>
            </tr>
        `;
    });
    document.getElementById('total_pedido').innerText = `R$ ${total.toLocaleString('pt-br', {minimumFractionDigits: 2})}`;
}

function finalizarPedido() {
    if(pedido.length === 0) return Swal.fire('Atenção', 'O carrinho está vazio!', 'warning');
    
    const idFornecedor = document.getElementById('select_fornecedor').value;

    fetch('api/salvar_pedido_compra.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_fornecedor: idFornecedor,
            itens: pedido
        })
    })
    .then(r => r.json())
    .then(res => {
        if(res.success) {
            Swal.fire('Sucesso', 'Pedido de compra gerado com sucesso!', 'success')
            .then(() => location.reload());
        }
    });
}