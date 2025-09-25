<?php
header('Content-Type: application/json');

$docu = json_decode(file_get_contents('php://input'), true);

$preguntaText = $docu['pregunta'];
$respostes = $docu['respostes'];
$correctaIndex = $docu['correcta'];
$imatge = $docu['imatge'];

$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de connexió a la BD: ' . $conn->connect_error]);
    exit();
}

// Inserim la pregunta amb sentències preparades per evitar errors de sintaxi
$sqlPregunta = "INSERT INTO PREGUNTES (PREGUNTA, LINK_IMATGE) VALUES (?, ?)";
$stmt = $conn->prepare($sqlPregunta);
$stmt->bind_param("ss", $preguntaText, $imatge);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta de pregunta: ' . $stmt->error]);
    exit();
}
$idPregunta = $conn->insert_id;
$stmt->close();

// Inserim les respostes amb sentències preparades
$sqlResposta = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sqlResposta);
foreach ($respostes as $index => $resposta) {
    $isCorrecta = 0;
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    }
    $stmt->bind_param("isi", $idPregunta, $resposta, $isCorrecta);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Error en la consulta de resposta: ' . $stmt->error]);
        exit();
    }
}
$stmt->close();

echo json_encode(['success' => true, 'message' => 'Pregunta i respostes creades correctament']);

$conn->close();
?>