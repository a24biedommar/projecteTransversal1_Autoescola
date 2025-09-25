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

$conn = new mysqli($servername, $username, $password, $dbname) or die("Error de connexió: " . mysqli_connect_error());

// Inserim les dades a la taula preguntes
$sqlPregunta = "INSERT INTO PREGUNTES (PREGUNTA, LINK_IMATGE) VALUES ('$preguntaText', '$imatge')";
$conn->query($sqlPregunta) or die("Error en la consulta de pregunta: " . mysqli_error($conn));
$idPregunta = $conn->insert_id;

// Inserim les respostes a la taula 'RESPOSTES' amb el bucle foreach
foreach ($respostes as $index => $resposta) {
    // Declarem lla variable per saber si es correcta o no
    $isCorrecta = 0;
    
    // utilitzem el if per saber si es correcta o no
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    }
    
    // fem la query 
    $sqlResposta = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) VALUES ('$idPregunta', '$resposta', '$isCorrecta')";
    
    //executem la query
    $conn->query($sqlResposta) or die("Error en la consulta de resposta: " . mysqli_error($conn));
}

echo json_encode(['success' => true, 'message' => 'Pregunta i respostes creades correctament']);

$conn->close();
?>