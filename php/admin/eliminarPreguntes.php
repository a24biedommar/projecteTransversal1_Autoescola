<?php
//iniciem la sessió
session_start();

header('Content-Type: application/json');

$docu = json_decode(file_get_contents('php://input'), true);
$idPregunta = $docu['id'];

// Inclou el fitxer de connexió
require_once '../connexio.php';

//eliminem les respostes associades a la pregunta seleccionada
$sqlRespostes = "DELETE FROM RESPOSTES WHERE ID_PREGUNTA = $idPregunta";
$conn->query($sqlRespostes);

// Després eliminem la pregunta seleccionada
$sqlPregunta = "DELETE FROM PREGUNTES WHERE ID_PREGUNTA = $idPregunta";
$conn->query($sqlPregunta);

// Retornem resultat
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes eliminades correctament']);

$conn->close();