let itensVenda = [];

function adicionarItem() {
    const select = document.getElementById('select_produto');
    const qtdInput = document.getElementById('qtd_item');
    const option = select.options[select.selectedIndex];

    if (!option.value) return;

    const preco = parseFloat(option.getAttribute('data-preco'));
    const qtd = parseFloat(qtdInput.value);

    const item = {
        id: option.value,
        nome: option.getAttribute('data-nome'),
        preco: preco,
        qtd: qtd,
        subtotal: preco * qtd
    };

    itensVenda.push(item);
    atualizarTabela();
    select.value = "";
    qtdInput.value = "1";
}

function atualizarTabela() {
    const corpo = document.querySelector('#tabela_itens tbody');
    if (!corpo) return;
    corpo.innerHTML = "";
    let subtotalGeral = 0;

    itensVenda.forEach((item, index) => {
        subtotalGeral += item.subtotal;
        corpo.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td style="text-align:center">${item.qtd}</td>
                <td>R$ ${item.preco.toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
                <td>R$ ${item.subtotal.toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
                <td style="text-align:center">
                    <button type="button" onclick="removerItem(${index})" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">X</button>
                </td>
            </tr>`;
    });

    const resSubtotal = document.getElementById('res_subtotal');
    if (resSubtotal) resSubtotal.innerText = `R$ ${subtotalGeral.toLocaleString('pt-br', {minimumFractionDigits: 2})}`;
    
    recalcularVenda();
}

function recalcularVenda() {
    const subtotal = itensVenda.reduce((acc, item) => acc + item.subtotal, 0);
    const desconto = parseFloat(document.getElementById('desconto_geral').value) || 0;
    const total = subtotal - desconto;
    
    const displayTotal = document.getElementById('total_final');
    if (displayTotal) {
        displayTotal.innerText = `R$ ${total.toLocaleString('pt-br', {minimumFractionDigits: 2})}`;
    }
}

function removerItem(index) {
    itensVenda.splice(index, 1);
    atualizarTabela();
}

function finalizarVenda() {
    if (itensVenda.length === 0) return Swal.fire("Aviso", "Carrinho vazio!", "warning");

    const dadosVenda = {
        id_cliente: document.getElementById('id_cliente').value || 1,
        desconto: document.getElementById('desconto_geral').value || 0,
        forma_pagamento: document.getElementById('forma_pagamento').value,
        itens: itensVenda
    };

    fetch('processar_venda.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosVenda)
    })
    .then(res => res.json())
    .then(retorno => {
        if (retorno.sucesso) {
            Swal.fire("Sucesso!", "Venda e Estoque atualizados.", "success")
                .then(() => window.location.reload());
        } else {
            Swal.fire("Erro", retorno.mensagem, "error");
        }
    });
}