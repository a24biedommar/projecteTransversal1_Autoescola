<?php


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


header('Content-Type: application/json');

$docu = json_decode(file_get_contents('php://input'), true);
$idPregunta = $docu['id'];


// Connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

$resultRespostes = $conn->query($sqlRespostes);
if(!$resultRespostes){
    echo json_encode(['success'=>false,'message'=>'Error eliminant respostes: '.$conn->error]);
    exit;
}

$resultPregunta = $conn->query($sqlPregunta);
if(!$resultPregunta){
    echo json_encode(['success'=>false,'message'=>'Error eliminant pregunta: '.$conn->error]);
    exit;
}

// Retornem resultat
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes eliminades correctament']);

$conn->close();