<?php
// Iniciem sessió
session_start();

// Inclou el fitxer de connexió
require_once '../connexio.php';

// Agafem totes les preguntes en ordre d'ID
$sqlPreguntes = "SELECT * FROM PREGUNTES ORDER BY ID_PREGUNTA";
$result = $conn->query($sqlPreguntes);

// Declarem l'array on guardarem les preguntes i respostes juntes
$preguntes = [];

// 1.preparem la consulta fora del bucle per optimitzar (consulta que agafa les respostes d'una pregunta concreta)
$stmtRespostes = $conn->prepare("SELECT ID_RESPOSTA, RESPOSTA FROM RESPOSTES WHERE ID_PREGUNTA = ? ORDER BY ID_RESPOSTA");

while ($row = $result->fetch_assoc()) {
    // Agafem l'id de la pregunta actual
    $idPregunta = $row['ID_PREGUNTA'];

    //2.executem la consulta preparada anteriorment per agafar les respostes de la pregunta actual
    //i: integer
    $stmtRespostes->bind_param("i", $idPregunta);
    $stmtRespostes->execute();
    $resResult = $stmtRespostes->get_result();

    // Declarem l'array on guardarem les respostes de la pregunta actual
    $respostes = [];
    while ($r = $resResult->fetch_assoc()) {
        $respostes[] = [
            'id' => $r['ID_RESPOSTA'],
            'resposta' => $r['RESPOSTA']
        ];
    }

    // Afegim la pregunta i les seves respostes a l'array principal
    $preguntes[] = [
        'id' => $idPregunta,
        'pregunta' => $row['PREGUNTA'],
        'respostes' => $respostes,
        'imatge' => $row['LINK_IMATGE']
    ];
}

//3.tanquem el prepared statement
$stmtRespostes->close();

// Retornem JSON
header('Content-Type: application/json');
echo json_encode(['preguntes' => $preguntes]);
?>