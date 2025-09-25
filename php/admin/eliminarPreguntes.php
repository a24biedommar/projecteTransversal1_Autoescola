<?php
header('Content-Type: application/json');

// Comprovem que arriba l'id
if (!isset($_POST['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No s\'ha rebut l\'ID de la pregunta'
    ]);
    exit;
}

$idPregunta = intval($_POST['id']); // Ens assegurem que és un número

// Connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

// Comprovem si hi ha error de connexió
if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de connexió: ' . $conn->connect_error
    ]);
    exit;
}

// Eliminem les respostes associades
$sqlRespostes = "DELETE FROM respostes WHERE id_pregunta = $idPregunta";
if (!$conn->query($sqlRespostes)) {
    echo json_encode([
        'success' => false,
        'message' => 'Error eliminant respostes: ' . $conn->error
    ]);
    $conn->close();
    exit;
}

// Eliminem la pregunta
$sqlPregunta = "DELETE FROM preguntes WHERE id = $idPregunta";
if (!$conn->query($sqlPregunta)) {
    echo json_encode([
        'success' => false,
        'message' => 'Error eliminant pregunta: ' . $conn->error
    ]);
    $conn->close();
    exit;
}

// Tot correcte
echo json_encode([
    'success' => true,
    'message' => 'Pregunta i respostes eliminades correctament'
]);

$conn->close();
?>
