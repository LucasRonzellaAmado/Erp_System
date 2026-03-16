<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'erp';

$mysql = new mysqli($host, $user, $pass, $db);

if ($mysql->connect_error) {
    die("Falha na conexão: " . $mysql->connect_error);
}
?>