<?php
header('Content-Type: application/json');

$idPregunta = $_POST['id'];

// Connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

//eliminem les respostes associades a la pregunta seleccionada
$sqlRespostes = "DELETE FROM respostes WHERE id_pregunta = $idPregunta";
$conn->query($sqlRespostes);

// Després eliminem la pregunta 
$sqlPregunta = "DELETE FROM preguntes WHERE id = $idPregunta";
$conn->query($sqlPregunta);

// Retornem el resultat del procés d'eliminació
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes eliminades correctament']);

$conn->close();