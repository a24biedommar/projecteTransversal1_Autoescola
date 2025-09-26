<?php
//iniciem la sessió
session_start();

header('Content-Type: application/json');

//rebem les dades del fetch i les decodifiquem en una variable $docu
$docu = json_decode(file_get_contents('php://input'), true);

//Anomenem les variables per agafar les dades del JSON
$idPregunta = $docu['id'];
$preguntaText = $docu['pregunta'];
$respostes = $docu['respostes']; // array de respostes
$correctaIndex = $docu['correcta'];

//fem la connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

//fem la query per actualitzar la pregunta
$sqlPregunta = "UPDATE PREGUNTES SET PREGUNTA = '$preguntaText' WHERE ID_PREGUNTA = '$idPregunta'";
$conn->query($sqlPregunta);

// Actualitzem les respostes
foreach ($respostes as $index => $resposta) {
    $isCorrecta = 0;
    if($index == $correctaIndex){
        $isCorrecta = 1;
    }
    $sqlResposta = "UPDATE RESPOSTES SET RESPOSTA = '$resposta', CORRECTA = '$isCorrecta' WHERE ID_PREGUNTA = '$idPregunta' AND ID_RESPOSTA = ".($index);
    $conn->query($sqlResposta);
}

// Retornem missatge d’èxit
echo json_encode(['success'=>true,'message'=>'Pregunta i respostes actualitzades correctament']);

$conn->close();
?>
