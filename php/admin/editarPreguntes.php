<?php
//iniciem la sessió
session_start();

header('Content-Type: application/json');

//rebem les dades del fetch i les decodifiquem en una variable $docu
$docu = json_decode(file_get_contents('php://input'), true);

// Anomenem les variables per agafar les dades del JSON
$idPregunta = (int)$docu['id'];
$preguntaText = $docu['pregunta'];
$imatge = $docu['imatge'];
$respostes = $docu['respostes'];
$correctaIndex = (int)$docu['correcta'];

//fem la connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

//fem la query per actualitzar la pregunta
$sqlPregunta = "UPDATE PREGUNTES 
                SET PREGUNTA = '$preguntaText', LINK_IMATGE = '$imatge' 
                WHERE ID_PREGUNTA = '$idPregunta'";
$conn->query($sqlPregunta);

// Reemplaçem les respostes: eliminem les existents i inserim les noves
$conn->query("DELETE FROM RESPOSTES WHERE ID_PREGUNTA = '$idPregunta'");

foreach ($respostes as $index => $resposta) {
    $isCorrecta = ($index === $correctaIndex) ? 1 : 0;
    $sqlInsert = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) 
                  VALUES ('$idPregunta', '$resposta', '$isCorrecta')";
    $conn->query($sqlInsert);
}

// Retornem missatge d’èxit
echo json_encode(['success'=>true,'message'=>'Pregunta i respostes actualitzades correctament']);

$conn->close();
?>
