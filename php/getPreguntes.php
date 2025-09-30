<?php 
session_start();

// Inicialització de la sessió
$_SESSION['index'] = 0;
$_SESSION['puntuacio'] = 0;
$_SESSION['preguntes'] = [];

require_once 'connexio.php'; 

//comprovem la connexió
if (!$conn || $conn->connect_error) {
    die(json_encode(['error' => 'Error de connexió a la BD.']));
}

$numPreguntes = 10;
$preguntesSeleccionades = [];
$preguntesNoCorrect = [];

//fem un select a la taula preguntes per obtenir 10 preguntes aleatories
$sqlPreguntes = "SELECT ID_PREGUNTA, PREGUNTA, LINK_IMATGE, ID_RESPOSTA_CORRECTA FROM PREGUNTES ORDER BY RAND() LIMIT $numPreguntes";

//fem un try catch per capturar errors de la consulta anterior
try {
    $result = $conn->query($sqlPreguntes);

    //si la consulta ha anat bé, guardem les preguntes en un array
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $preguntesSeleccionades[] = $row;
        }
    } else {
        // En cas d'error de consulta, aturem
        die(json_encode(['error' => 'Error en obtenir les preguntes.']));
    }

} catch (Throwable $e) {
    die(json_encode(['error' => 'Error de BD al seleccionar preguntes.']));
}


//fem un for each per obtenir les respostes de cada pregunta
foreach($preguntesSeleccionades as $pregunta){
    
    $id = $pregunta['ID_PREGUNTA'];

    $sqlRespostes = "SELECT ID_RESPOSTA, RESPOSTA FROM RESPOSTES WHERE ID_PREGUNTA = $id ORDER BY ID_RESPOSTA";
    
    $respostes = [];
    
    //fem un try catch per capturar errors de la consulta de respostes
    try {
        $resResult = $conn->query($sqlRespostes);

        //si la consulta de repostes ha anat bé, les guardem en un array
        if ($resResult) {
            while($r = $resResult->fetch_assoc()){
                $respostes[] = [
                    'id' => $r['ID_RESPOSTA'],
                    'resposta' => $r['RESPOSTA'],
                ];
            }
        } else {
            //si no ha anat be, saltem aquesta pregunta
            continue; 
        }

    } catch (Throwable $e) {
        //si falla la consulta, saltem aquesta pregunta
        continue;
    }

    // Afegim la pregunta completa i guardem l'ID a la sessió
    $preguntesNoCorrect[] = [
        'id' => $pregunta['ID_PREGUNTA'],
        'pregunta' => $pregunta['PREGUNTA'],
        'respostes' => $respostes,
        'imatge' => $pregunta['LINK_IMATGE'],
    ];

    $_SESSION['preguntes'][] = $pregunta['ID_PREGUNTA'];
}

// Creem el fitxer JSON
header('Content-Type: application/json');
echo json_encode(['preguntes' => $preguntesNoCorrect]);

// Tanquem connexió
$conn->close();
