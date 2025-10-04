<?php 

session_start();

require_once 'connexio.php';

//inicialitzem les variables a 0 per estalbiar-nos errors
$_SESSION['index'] = 0;
$_SESSION['puntuacio'] = 0;
$_SESSION['preguntes'] = [];

//fem un select per obtenir totes les preguntes de la base de dades.
$sqlPreguntes = "SELECT * FROM PREGUNTES"; 
$result = $conn->query($sqlPreguntes);

//guardem totes les preguntes de la consulta anterior en un array
$preguntesSeleccionades = [];
while ($row = $result->fetch_assoc()) {
    $preguntesSeleccionades[] = $row;
}

//fem un suffle per barregar l'array anterior
shuffle($preguntesSeleccionades);

$preguntesNoCorrect = [];
$stmtRespostes = $conn->prepare("SELECT ID_RESPOSTA, RESPOSTA FROM RESPOSTES WHERE ID_PREGUNTA = ? ORDER BY RAND()");

foreach($preguntesSeleccionades as $pregunta){
    $id = $pregunta['ID_PREGUNTA'];

    $stmtRespostes->bind_param("i", $id);
    $stmtRespostes->execute();
    $resResult = $stmtRespostes->get_result();

    $respostes = [];
    while($r = $resResult->fetch_assoc()){
        $respostes[] = [
            'id' => $r['ID_RESPOSTA'],
            'resposta' => $r['RESPOSTA'],
        ];
    }

    $preguntesNoCorrect[] = [
        'id' => $pregunta['ID_PREGUNTA'],
        'pregunta' => $pregunta['PREGUNTA'],
        'respostes' => $respostes,
        'imatge' => $pregunta['LINK_IMATGE']
    ];

    $_SESSION['preguntes'][] = $pregunta['ID_PREGUNTA'];
}

$stmtRespostes->close();

// Creem el fitxer JSON amb les preguntes que mostrarem a l'usuari
header('Content-Type: application/json');
echo json_encode(['preguntes' => $preguntesNoCorrect]);
