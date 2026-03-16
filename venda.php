<?php
require_once 'include/auth.php';
require_once 'include/conexao.php';

if (!isset($_SESSION['caixa_aberto']) || $_SESSION['caixa_aberto'] === false) {
    echo "<!DOCTYPE html>
    <html lang='pt-br'>
    <head>
        <meta charset='UTF-8'>
        <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
        <link rel='stylesheet' href='assents/layout.css'> 
    </head>
    <body style='background-color: #f1f5f9;'>
        <script>
            window.onload = function() {
                Swal.fire({
                    icon: 'warning',
                    title: 'Caixa Fechado!',
                    text: 'Você precisa abrir o caixa para acessar o PDV.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Ir para Gerenciamento de Caixa',
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'caixa.php';
                    }
                });
            }
        </script>
    </body>
    </html>";
    exit;
}

if (!in_array($_SESSION['nivel'], ['gerente', 'vendedor', 'caixa', 'admin'])) {
    header("Location: home.php?erro=sem_permissao");
    exit;
}

$res_clientes = $mysql->query("SELECT id, nome FROM clientes ORDER BY nome ASC");
$sql_produtos = "SELECT id, nome, 
    CASE WHEN preco_venda > 0 THEN preco_venda WHEN preco > 0 THEN preco ELSE 0 END as preco_venda, 
    quantidade FROM estoque WHERE status IN ('Ativo', '1', '') OR status IS NULL ORDER BY nome ASC";
$res_produtos = $mysql->query($sql_produtos);
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>NexusFlow - PDV</title>
    <link rel="stylesheet" href="assents/layout.css">
    <link rel="stylesheet" href="assents/pdv_venda.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

<div class="container" style="display: flex;">
    <?php include 'include/sidebar.php'; ?>

    <div class="conteudo-pdv">
        <header class="pdv-header">
            <div>
                <h2>🛒 Frente de Caixa (PDV)</h2>
                <p>Realize vendas rápidas e emita comprovantes.</p>
            </div>
            <div class="operador-badge">
                <small>Operador: <strong><?= explode(' ', $_SESSION['nome'])[0] ?></strong></small><br>
                <span class="status-caixa">● CAIXA ABERTO</span>
            </div>
        </header>

        <div class="pdv-grid">
            <div class="col-principal">
                <section class="card-erp">
                    <label class="label-tiny">1. IDENTIFICAR CLIENTE</label>
                    <div class="cliente-input-group">
                        <input type="number" id="busca_id_cliente" placeholder="ID" oninput="buscarClientePorId(this.value)">
                        <select id="id_cliente">
                            <option value="1">Consumidor Final</option>
                            <?php while($c = $res_clientes->fetch_assoc()): ?>
                                <option value="<?= $c['id'] ?>"><?= $c['nome'] ?></option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                </section>

                <section class="card-erp">
                    <label class="label-tiny">2. ADICIONAR ITENS</label>
                    <div class="produto-input-group">
                        <select id="select_produto">
                            <option value="">Pesquisar ou selecionar produto...</option>
                            <?php 
                            mysqli_data_seek($res_produtos, 0); 
                            while($p = $res_produtos->fetch_assoc()): ?>
                                <option value="<?= $p['id'] ?>" data-nome="<?= $p['nome'] ?>" data-preco="<?= $p['preco_venda'] ?>">
                                    <?= $p['nome'] ?> - R$ <?= number_format($p['preco_venda'], 2, ',', '.') ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                        <input type="number" id="qtd_item" value="1" min="1">
                        <button class="btn-add-pdv" onclick="adicionarItemPDV()">ADICIONAR</button>
                    </div>

                    <div class="scroll-table">
                        <table class="table-pdv" id="tabela_itens_venda">
                            <thead>
                                <tr>
                                    <th>PRODUTO</th>
                                    <th class="center">QTD</th>
                                    <th>VALOR UNIT.</th>
                                    <th>SUBTOTAL</th>
                                    <th class="center">AÇÃO</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </section>
            </div>

            <div class="col-lateral">
                <div class="card-erp summary-pdv">
                    <div class="resumo-linha">
                        <span>Subtotal Itens:</span>
                        <strong id="res_subtotal">R$ 0,00</strong>
                    </div>
                    
                    <div class="resumo-linha">
                        <label>Desconto (R$):</label>
                        <input type="number" id="desconto_geral" value="0.00" step="0.01" oninput="recalcularPDV()">
                    </div>

                    <hr>

                    <label class="label-tiny">FORMA DE PAGAMENTO</label>
                    <select id="forma_pagamento" onchange="toggleParcelas()">
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Pix">Pix</option>
                        <option value="Cartão Débito">Cartão Débito</option>
                        <option value="Cartão Crédito">Cartão Crédito</option>
                    </select>

                    <div id="div_parcelas" class="hidden">
                        <label class="label-tiny">PARCELAMENTO</label>
                        <select id="parcelas">
                            <option value="1">1x à vista</option>
                            <option value="2">2x sem juros</option>
                            <option value="3">3x sem juros</option>
                        </select>
                    </div>

                    <div class="total-box-pdv">
                        <small>TOTAL FINAL</small>
                        <span id="total_final_exibicao">R$ 0,00</span>
                    </div>

                    <div class="card-erp fiscal-toggle-area">
                        <label class="switch-fiscal">
                            <input type="checkbox" id="emitir_nota">
                            <span class="slider-fiscal"></span>
                        </label>
                        <span class="label-fiscal">Gerar Nota Fiscal?</span>
                    </div>

                    <button class="btn-finalize" onclick="finalizarVendaPDV()">🚀 FINALIZAR VENDA</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="assents/pdv_venda.js"></script>
</body>
</html>