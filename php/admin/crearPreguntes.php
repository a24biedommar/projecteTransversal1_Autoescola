<?php
//iniciem la sessió
session_start();

header('Content-Type: application/json');

$docu = json_decode(file_get_contents('php://input'), true);

$preguntaText = $docu['pregunta'];
$respostes = $docu['respostes'];
$correctaIndex = $docu['correcta'];
$imatge = $docu['imatge'];

// Inclou el fitxer de connexió
require_once 'connexio.php';

//fem el select de l'id mes alt i sumem 1 
$sqlId = "SELECT MAX(ID_PREGUNTA) + 1 FROM PREGUNTES";
$result = $conn->query($sqlId);
$row = $result->fetch_row();
$id_pregunta = $row[0];

// Inserim les dades a la taula preguntes
$sqlPregunta = "INSERT INTO PREGUNTES (ID_PREGUNTA, PREGUNTA, LINK_IMATGE) VALUES ('$id_pregunta','$preguntaText', '$imatge')";
$conn->query($sqlPregunta);


// Inserim les respostes a la taula 'RESPOSTES' amb el bucle foreach
foreach ($respostes as $index => $resposta) {
    // Declarem lla variable per saber si es correcta o no
    $isCorrecta = 0;
    
    // utilitzem el if per saber si es correcta o no
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    }
    
    // fem la query 
    $sqlResposta = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) VALUES ('$id_pregunta', '$resposta', '$isCorrecta')";
    
    //executem la query
    $conn->query($sqlResposta) or die("Error en la consulta de resposta: " . mysqli_error($conn));
}

echo json_encode(['success' => true, 'message' => 'Pregunta i respostes creades correctament']);

$conn->close();
?>