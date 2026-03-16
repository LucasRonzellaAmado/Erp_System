<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../include/conexao.php';

header('Content-Type: application/json');

$id_cliente = isset($_GET['id_cliente']) ? intval($_GET['id_cliente']) : 0;

if ($id_cliente > 0) {
    $sql = "SELECT 
                id, 
                data_venda, 
                valor_total, 
                forma_pagamento,
                'Venda Finalizada' as nome_produto
            FROM vendas 
            WHERE id_cliente = $id_cliente 
            ORDER BY data_venda DESC";

    $res = $mysql->query($sql);

    if (!$res) {
        echo json_encode(["erro" => $mysql->error, "sql" => $sql]);
        exit;
    }

    $vendas = [];
    while($row = $res->fetch_assoc()) {
        $row['data_venda'] = date('d/m/Y H:i', strtotime($row['data_venda']));
        $vendas[] = $row;
    }
    
    echo json_encode($vendas);
} else {
    echo json_encode([]);
}
?>