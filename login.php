<?php
include('include/conexao.php');
if (isset($_POST['usuario']) && isset($_POST['senha'])) {
    $user_input = $mysql->real_escape_string($_POST['usuario']);
    $pass_input = $mysql->real_escape_string($_POST['senha']);
    $sql = "SELECT * FROM usuarios WHERE usuario = '$user_input' AND senha = '$pass_input'";
    $result = $mysql->query($sql);

    if ($result && $result->num_rows == 1) {
        $usuario_db = $result->fetch_assoc();

        if(!isset($_SESSION)) {
            session_start();
        }
        $_SESSION['id']         = $usuario_db['id'];
        $_SESSION['usuario_id'] = $usuario_db['id'];
        $_SESSION['nome']       = $usuario_db['nome'];
        $_SESSION['nivel']      = $usuario_db['nivel'];
        $_SESSION['status']     = $usuario_db['status'];

        header("Location: home.php");
        exit;

    } else {
        echo "<script>alert('Usuário ou senha incorretos!');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Login - NexusFlow</title>
    <link rel="stylesheet" href="assents/login.css?v=<?= time() ?>">
</head>
<body>

    <div class="login">
        <h1>Entrar</h1>

        <form action="" method="post">
            <p>
                <label>Usuário</label><br>
                <input class="nome" type="text" name="usuario" required>
            </p>

            <p>
                <label>Senha</label><br>
                <input class="senha" type="password" name="senha" required>
            </p>

            <p>
                <button class="enviar" type="submit">Entrar</button>
            </p>
        </form>
    </div>

</body>
</html>
