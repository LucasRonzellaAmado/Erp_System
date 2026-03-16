<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$paginaAtual = basename($_SERVER['PHP_SELF']);
$nivel = strtolower($_SESSION['nivel'] ?? '');
?>

<link rel="stylesheet" href="assents/sidebar.css">

<div class="sidebar">
    <div class="logo">
        <img src="assents/Logo.png" alt="Logo" style="width: 100%; max-width: 150px; height: auto; display: block; margin: 0 auto;">
    </div>

    <nav class="menu">
        <a class="<?= $paginaAtual == 'home.php' ? 'ativo' : '' ?>" href="home.php">
            🏠 <span>Home</span>
        </a>

        <?php if (in_array($nivel, ['admin', 'gerente', 'vendedor'])): ?>
            <a class="<?= $paginaAtual == 'venda.php' ? 'ativo' : '' ?>" href="venda.php">
                🛒 <span>Venda</span>
            </a>
            <a class="<?= $paginaAtual == 'orcamento.php' ? 'ativo' : '' ?>" href="orcamento.php">
                🧾 <span>Orçamento</span>
            </a>
        <?php endif; ?>

        <?php if (in_array($nivel, ['admin', 'gerente', 'vendedor', 'caixa'])): ?>
            <a class="<?= $paginaAtual == 'historico-orcamento.php' ? 'ativo' : '' ?>" href="historico-orcamento.php">
                📚 <span>Histórico Orçamento</span>
            </a>
        <?php endif; ?>

        <?php if (in_array($nivel, ['gerente', 'caixa', 'vendedor', 'admin'])): ?>
            <a class="<?= $paginaAtual == 'historico-venda.php' ? 'ativo' : '' ?>" href="historico-venda.php">
                📑 <span>Histórico Vendas</span>
            </a>
        <?php endif; ?>

        <?php if (in_array($nivel, ['gerente', 'caixa', 'admin'])): ?>
            <a class="<?= $paginaAtual == 'caixa.php' ? 'ativo' : '' ?>" href="caixa.php">
                💰 <span>Caixa</span>
            </a>
        <?php endif; ?>
        
        <?php if (in_array($nivel, ['gerente', 'vendedor', 'admin'])): ?>
            <a class="<?= $paginaAtual == 'cliente.php' ? 'ativo' : '' ?>" href="cliente.php">
                🧑 <span>Cliente</span>
            </a>
        <?php endif; ?>

        <?php if (in_array($nivel, ['gerente', 'estoque', 'admin'])): ?>
            <a class="<?= $paginaAtual == 'estoque.php' ? 'ativo' : '' ?>" href="estoque.php">
                📦 <span>Estoque</span>
            </a>
        <?php endif; ?>

        <?php if (in_array($nivel, ['gerente', 'admin'])): ?>
            <a class="<?= $paginaAtual == 'cadastrar_fornecedor.php' ? 'ativo' : '' ?>" href="cadastrar_fornecedor.php">
                🚚 <span>Fornecedor</span>
            </a>
        <?php endif; ?>
        
        <?php if (in_array($nivel, ['gerente', 'estoque', 'admin'])): ?>
            <a class="<?= $paginaAtual == 'pedido_compra.php' ? 'ativo' : '' ?>" href="pedido_compra.php">
                📝 <span>Pedido Compra</span>
            </a>
        <?php endif; ?>

        <?php if (in_array($nivel, ['gerente', 'admin'])): ?>
            <a class="<?= $paginaAtual == 'fiscal.php' ? 'ativo' : '' ?>" href="fiscal.php">
                🏛️ <span>Notas Fiscais</span>
            </a>
        <?php endif; ?>
    </nav>

    <div class="rodape">

                <a href="action/logout.php" class="logout">

                    🚪 <span>Sair</span>

        </a>
    </div>
</div>