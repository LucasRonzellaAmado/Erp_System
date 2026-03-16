<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once '../include/conexao.php'; 
header('Content-Type: application/json');

$data_input = json_decode(file_get_contents('php://input'), true);

if (!$data_input || empty($data_input['itens'])) { 
    echo json_encode(['sucesso' => false, 'mensagem' => 'Carrinho vazio.']); exit; 
}

try {
    $id_cliente = $data_input['id_cliente'] ?? 1;
    $forma_pgto = $data_input['forma_pagamento'] ?? 'Dinheiro';
    $desconto_total = floatval($data_input['desconto'] ?? 0);
    $gerar_nf = isset($data_input['gerar_nf']) ? intval($data_input['gerar_nf']) : 0;
    $usuario_id = $_SESSION['usuario_id'] ?? 1; // Pega o ID do vendedor logado
    $id_caixa = $_SESSION['caixa_id'] ?? 1;     // Pega o ID do caixa aberto

    foreach ($data_input['itens'] as $item) {
            $id_prod = intval($item['id']);
            $qtd = floatval($item['qtd']);
            $preco = floatval($item['preco']);
            $subtotal_item = $qtd * $preco; // Valor real deste item

            $mysql->query("UPDATE estoque SET quantidade = quantidade - $qtd WHERE id = $id_prod");

            $sql_venda = "INSERT INTO vendas (
                id_cliente, usuario_id, id_caixa, valor_bruto, valor_desconto, 
                produto_id, quantidade, valor_unitario, valor_total, 
                forma_pagamento, data_venda, status_venda, gerar_nf
            ) VALUES (
                $id_cliente, $usuario_id, $id_caixa, $subtotal_item, 0, 
                $id_prod, $qtd, $preco, $subtotal_item, 
                '$forma_pgto', NOW(), 'Finalizada', $gerar_nf
            )";
            
            $mysql->query($sql_venda);
        }

    echo json_encode(['sucesso' => true]);

} catch (Exception $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>