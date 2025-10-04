<?php 

session_start();

require_once 'connexio.php';

//inicialitzem les variables a 0 per estalbiar-nos errors
$_SESSION['index'] = 0;
$_SESSION['puntuacio'] = 0;
$_SESSION['preguntes'] = [];

// Consultem totes les preguntes de la base de dades i les barregem aleatòriament
$sqlPreguntes = "SELECT * FROM PREGUNTES ORDER BY RAND()"; 
$result = $conn->query($sqlPreguntes);

// Inicialitzem l'array on guardarem les preguntes seleccionades
$preguntesSeleccionades = [];

// Recorrem cada fila del resultat($result) i l'afegim a l'array $preguntesSeleccionades
while ($row = $result->fetch_assoc()) {
    $preguntesSeleccionades[] = $row;
}

//declarem la variable (array) on guardarem les preguntes i respostes sense correctIndex
$preguntesNoCorrect = [];

// per cada pregunta seleccionada, busquem les respostes
foreach($preguntesSeleccionades as $pregunta){
    // guardem l'id de la pregunta actual
    $id = $pregunta['ID_PREGUNTA'];

    //Per evitar errors de vulnerabilitat fem servir prepared statements
    
    $stmt = $conn->prepare("SELECT ID_RESPOSTA, RESPOSTA FROM RESPOSTES WHERE ID_PREGUNTA = ? ORDER BY RAND()");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resResult = $stmt->get_result();

    $respostes = [];

    //fem un bucle per guardar les respostes de la pregunta actual
    while($r = $resResult->fetch_assoc()){
        $respostes[] = [
            'id' => $r['ID_RESPOSTA'],
            'resposta' => $r['RESPOSTA'],
        ];
    }

    // Afegim la pregunta completa (tots els seus atributs) a l'array final
    $preguntesNoCorrect[] = [
        'id' => $pregunta['ID_PREGUNTA'],
        'pregunta' => $pregunta['PREGUNTA'],
        'respostes' => $respostes,
        'imatge' => $pregunta['LINK_IMATGE']
    ];

    // Guardem només l'ID de la pregunta a la sessió per a futures validacions
    $_SESSION['preguntes'][] = $pregunta['ID_PREGUNTA'];
}

// Creem el fitxer JSON amb les preguntes que mostrarem a l'usuari
header('Content-Type: application/json');
echo json_encode(['preguntes' => $preguntesNoCorrect]);
