<?php
//iniciem la sessió
session_start();
//
require_once '../connexio.php';

header('Content-Type: application/json');


$docu = json_decode(file_get_contents('php://input'), true);
$idPregunta = $docu['id'];

// 1. eliminem les respostes de la pregunta seleccionada amb un prepared statement
$stmtRespostes = $conn->prepare("DELETE FROM RESPOSTES WHERE ID_PREGUNTA = ?");
//i: integer
$stmtRespostes->bind_param("i", $idPregunta);
$stmtRespostes->execute();
$stmtRespostes->close();

// 2. elimiem la pregunta seleccionada amb un prepared statement
$stmtPregunta = $conn->prepare("DELETE FROM PREGUNTES WHERE ID_PREGUNTA = ?");
//i: integer
$stmtPregunta->bind_param("i", $idPregunta);
$stmtPregunta->execute();
$stmtPregunta->close();

// Retornem resultat
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes eliminades correctament']);

$conn->close();