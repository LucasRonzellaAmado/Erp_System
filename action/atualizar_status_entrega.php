<?php
require_once '../include/auth.php';
require_once '../include/conexao.php';

header('Content-Type: application/json');

// Recebe os dados do fetch (JSON)
$dados = json_decode(file_get_contents('php://input'), true);

if (!$dados || !isset($dados['id_venda'])) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos']);
    exit;
}

$id_venda = intval($dados['id_venda']);
$novo_status = $mysql->real_escape_string($dados['status']);
$entregador = isset($dados['entregador']) ? $mysql->real_escape_string($dados['entregador']) : null;

try {
    $mysql->begin_transaction();

    // 1. Atualiza o status na tabela principal de vendas
    $mysql->query("UPDATE vendas SET status_entrega = '$novo_status' WHERE id = $id_venda");

    // 2. Se houver um entregador informado, salva ele na tabela de entregas
    if ($entregador) {
        $mysql->query("UPDATE venda_entregas SET entregador = '$entregador' WHERE id_venda = $id_venda");
    }

    $mysql->commit();
    echo json_encode(['sucesso' => true]);

} catch (Exception $e) {
    $mysql->rollback();
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}