<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

if (!isset($_POST['id'])) {
    echo json_encode(['success' => false, 'message' => 'No s\'ha rebut l\'ID']);
    exit;
}

$idPregunta = intval($_POST['id']);

$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connexió fallida: ' . $conn->connect_error]);
    exit;
}

// Afegim debug
echo json_encode(['debug_id' => $idPregunta]); exit;
