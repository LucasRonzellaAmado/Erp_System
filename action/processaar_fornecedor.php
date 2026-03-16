<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../include/conexao.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_SESSION['id'] ?? 1;
    
    $doc = preg_replace('/\D/', '', $_POST['documento']);
    $mysql->begin_transaction();

    try {
        $sql = "INSERT INTO fornecedores (
                    tipo_pessoa, razao_social, nome_fantasia, documento, 
                    celular, email, contato_responsavel, cep, rua, 
                    numero, bairro, cidade, estado, tipo_fornecimento, 
                    prazo_entrega_medio, usuario_cadastrou
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $mysql->prepare($sql);
        
        $stmt->bind_param("ssssssssssssssii", 
            $_POST['tipo_pessoa'], 
            $_POST['razao_social'], 
            $_POST['nome_fantasia'], 
            $doc,
            $_POST['celular'], 
            $_POST['email'], 
            $_POST['contato_responsavel'], 
            $_POST['cep'],
            $_POST['rua'], 
            $_POST['numero'], 
            $_POST['bairro'], 
            $_POST['cidade'],
            $_POST['estado'], 
            $_POST['tipo_fornecimento'], 
            $_POST['prazo_entrega_medio'], 
            $user_id
        );
        
        $stmt->execute();
        $id_f = $mysql->insert_id;
        $sql_c = "INSERT INTO fornecedor_contas (id_fornecedor, banco, agencia, conta, chave_pix) VALUES (?, ?, ?, ?, ?)";
        $stmt_c = $mysql->prepare($sql_c);
        $stmt_c->bind_param("issss", 
            $id_f, 
            $_POST['banco'], 
            $_POST['agencia'], 
            $_POST['conta'], 
            $_POST['chave_pix']
        );
        $stmt_c->execute();

        $mysql->commit();
        
        header("Location: ../cadastrar_fornecedor.php?sucesso=1");
        exit;

    } catch (Exception $e) {
        $mysql->rollback();
        echo "Erro ao salvar fornecedor: " . $e->getMessage();
    }
} else {
    header("Location: ../cadastrar_fornecedor.php");
    exit;
}