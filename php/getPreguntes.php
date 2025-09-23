<?php 
//iniciem la sessió
session_start();

//inicialitzem les variables a 0 per estalbiar-nos errors
$_SESSION['index'] = 0;
$_SESSION['puntuacio'] = 0;
$_SESSION['preguntes'] = [];

// Inicialitzem les variables de connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@"; 
$dbname = "a24biedommar_Projecte0"; 

$conn = new mysqli($servername, $username, $password, $dbname);

//creem la variable que ens diu quantes preguntes volem mostrar
$numPreguntes = 10;

// agafem $numPreguntes preguntes aleatòries de la taula PREGUNTES (index i pregunta)
$sqlPreguntes = "SELECT * FROM PREGUNTES ORDER BY RAND() LIMIT $numPreguntes";
$result = $conn->query($sqlPreguntes);

// Inicialitzem l'array on guardarem les preguntes seleccionades
$preguntesSeleccionades = [];

// Recorrem cada fila del resultat($result) i l'afegim a l'array $preguntesSeleccionades
while ($row = $result->fetch_assoc()) {
    $preguntesSeleccionades[] = $row;
}

//declarem la variable (array) on guardarem les preguntes i respostes sense correctIndex
$preguntesNoCorrect = [];

//fem un foreach per cada pregunta seleccionada i per guardar aquesta a preguntesNoCorrect
foreach($preguntesSeleccionades as $pregunta){
    
    //guardem l'id de la pregunta actual
    $id = $pregunta['ID_PREGUNTA'];

    // Consultem respostes
    $sqlRespostes = "SELECT ID_RESPOSTA, RESPOSTA, LINK_IMATGE FROM RESPOSTES WHERE ID_PREGUNTA = $id ORDER BY ID_RESPOSTA";
    $resResult = $conn->query($sqlRespostes);
    var_dump($resResult);

    $respostes = [];
    while($r = $resResult->fetch_assoc()){
        $respostes[] = $r;
    }

    $preguntesNoCorrect[] = [
        'id' => $pregunta['ID_PREGUNTA'],
        'pregunta' => $pregunta['PREGUNTA'],
        'respostes' => $respostes,
        'imatge' => $pregunta['LINK_IMATGE']
    ];

    // Guardem només l'ID de la pregunta a la sessió per després corregir el quiz
    $_SESSION['preguntes'][] = $pregunta['ID_PREGUNTA'];
}


//creem el fitxer json amb les preguntes que mostrarem al usuari
header('Content-Type: application/json');
echo json_encode($preguntesNoCorrect);

?>
