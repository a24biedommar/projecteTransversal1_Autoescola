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

$sqlPregunta = "INSERT INTO PREGUNTES (PREGUNTA, LINK_IMATGE) VALUES ('$preguntaText', '$imatge')";
$conn->query($sqlPregunta);
$idPregunta = $conn->insert_id;

foreach ($respostes as $index => $resposta) {
    $isCorrecta = 0;
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    }
    $sqlResposta = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) VALUES ('$idPregunta', '$resposta', '$isCorrecta')";
    $conn->query($sqlResposta);
}

echo json_encode(['success' => true, 'message' => 'Pregunta i respostes creades correctament']);

$conn->close();
?>