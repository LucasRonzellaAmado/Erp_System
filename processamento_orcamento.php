<?php
session_start();
require_once '../include/conexao.php';

if (ob_get_length()) ob_clean();
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
    exit;
}

$usuario_id = $_SESSION['id'] ?? null;
$id_fornecedor = !empty($input['id_fornecedor']) ? intval($input['id_fornecedor']) : null;
$itens = $input['itens'] ?? [];

if (!$id_fornecedor) {
    echo json_encode(['success' => false, 'message' => 'Selecione um fornecedor.']);
    exit;
}

if (empty($itens)) {
    echo json_encode(['success' => false, 'message' => 'O pedido está vazio.']);
    exit;
}

$total_pedido = 0;
foreach ($itens as $i) {
    $total_pedido += (floatval($i['preco']) * intval($i['qtd']));
}

$mysql->begin_transaction();

try {
    $sql = "INSERT INTO pedidos_compra (id_fornecedor, usuario_id, valor_total, status, data_pedido) 
            VALUES (?, ?, ?, 'Pendente', NOW())";
    
    $stmt = $mysql->prepare($sql);
    if (!$stmt) throw new Exception("Erro SQL: " . $mysql->error);

    $stmt->bind_param("iid", $id_fornecedor, $usuario_id, $total_pedido);
    
    if (!$stmt->execute()) throw new Exception("Falha ao gravar pedido: " . $stmt->error);
    
    $id_pedido = $mysql->insert_id;

    $stmt_i = $mysql->prepare("INSERT INTO pedido_compra_itens (id_pedido, id_produto, quantidade, preco_custo, subtotal) VALUES (?, ?, ?, ?, ?)");
    
    foreach ($itens as $item) {
        $prod_id = intval($item['id']);
        $qtd     = intval($item['qtd']);
        $preco   = floatval($item['preco']);
        $sub     = $preco * $qtd;
        
        $stmt_i->bind_param("iiidd", $id_pedido, $prod_id, $qtd, $preco, $sub);
        if (!$stmt_i->execute()) throw new Exception("Erro no item: " . $stmt_i->error);
    }

    $mysql->commit();
    
    echo json_encode([
        'success' => true, 
        'id' => $id_pedido
    ]);

} catch (Exception $e) {
    $mysql->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}