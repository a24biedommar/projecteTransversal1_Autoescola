<?php
// Iniciem sessió
session_start();

// Inclou el fitxer de connexió
require_once 'connexio.php';

// Agafem totes les preguntes en ordre d'ID
$sqlPreguntes = "SELECT * FROM PREGUNTES ORDER BY ID_PREGUNTA";
$result = $conn->query($sqlPreguntes);

// Declarem l'array on guardarem les preguntes i respostes juntes
$preguntes = [];

while ($row = $result->fetch_assoc()) {
    // Agafem l'id de la pregunta actual
    $idPregunta = $row['ID_PREGUNTA'];

    // Agafem totes les respostes de la pregunta actual
    $sqlRespostes = "SELECT ID_RESPOSTA, RESPOSTA FROM RESPOSTES WHERE ID_PREGUNTA = $idPregunta ORDER BY ID_RESPOSTA";
    $resResult = $conn->query($sqlRespostes);

    // Declarem l'array on guardarem les respostes de la pregunta actual
    $respostes = [];
    while ($r = $resResult->fetch_assoc()) {
        $respostes[] = [
            'id' => $r['ID_RESPOSTA'],
            'resposta' => $r['RESPOSTA']
        ];
    }

    // Afegim la pregunta i les seves respostes a l'array principal (on guardem les preguntes i respostes juntes)
    $preguntes[] = [
        'id' => $idPregunta,
        'pregunta' => $row['PREGUNTA'],
        'respostes' => $respostes,
        'imatge' => $row['LINK_IMATGE']
    ];
}

// Retornem JSON
header('Content-Type: application/json');
echo json_encode(['preguntes' => $preguntes]);
?>