<?php
require_once '../include/auth.php';
require_once '../include/conexao.php';

header('Content-Type: application/json');

$json = file_get_contents('php://input');
$dados = json_decode($json, true);

if (!$dados || empty($dados['itens'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Carrinho vazio.']);
    exit;
}

$usuario_id = $_SESSION['id'] ?? 1; 
$id_caixa   = $_SESSION['id_caixa_atual'] ?? 1;

$mysql->begin_transaction();

try {
    $id_cliente  = (!empty($dados['id_cliente'])) ? intval($dados['id_cliente']) : "NULL";
    $desconto    = floatval($dados['desconto'] ?? 0);
    $forma_pagto = $mysql->real_escape_string($dados['forma_pagamento']);
    $total_venda = floatval($dados['total']);
    $gerar_nf    = isset($dados['gerar_nf']) ? intval($dados['gerar_nf']) : 0;

    $sql_venda = "INSERT INTO vendas (id_cliente, usuario_id, id_caixa, valor_bruto, valor_desconto, valor_total, forma_pagamento, status_venda, data_venda, gerar_nf) 
                  VALUES ($id_cliente, $usuario_id, $id_caixa, $total_venda, $desconto, $total_venda, '$forma_pagto', 'Finalizada', NOW(), $gerar_nf)";
    
    if (!$mysql->query($sql_venda)) {
        throw new Exception($mysql->error);
    }
    
    $venda_id = $mysql->insert_id;

    foreach ($dados['itens'] as $item) {
        $id_p = intval($item['id']);
        $qtd  = floatval($item['qtd']);
        $pre  = floatval($item['preco']);
        $tot  = $qtd * $pre;

        $res_custo = $mysql->query("SELECT preco_custo FROM estoque WHERE id = $id_p");
        $custo = ($res_custo->num_rows > 0) ? $res_custo->fetch_assoc()['preco_custo'] : 0;

        $sql_item = "INSERT INTO venda_itens (id_venda, id_produto, quantidade, preco_unitario, custo_unitario, valor_total_item) 
                     VALUES ($venda_id, $id_p, $qtd, $pre, $custo, $tot)";
        
        if (!$mysql->query($sql_item)) {
            throw new Exception($mysql->error);
        }

        $mysql->query("UPDATE estoque SET quantidade = quantidade - $qtd WHERE id = $id_p");
    }

    $mysql->commit();
    echo json_encode(['sucesso' => true, 'venda_id' => $venda_id]);

} catch (Exception $e) {
    $mysql->rollback();
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}