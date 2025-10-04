<?php 

//iniciem la sessió
session_start();

// Inclou el fitxer de connexió
require_once 'connexio.php';

// decodifiquem el fitxer json que ha generat el script de index.html (enviat per petició http)
$json_data = file_get_contents('php://input');
$respostesUsuari = json_decode($json_data, true);

//creem les variables seguents:
$preguntes = $_SESSION['preguntes']; //agafem les preguntes que s'han mostrat a index.html
$puntuacio = 0; //inicialitzem la puntuació del usuari

//preparem el statement fora del bucle per no estar preparant-lo en cada iteració
$stmt = $conn->prepare("SELECT ID_RESPOSTA FROM RESPOSTES WHERE ID_PREGUNTA = ? AND CORRECTA = 1");

// Recorrem les respostes de l'usuari i les comparemm amb les correctes
foreach ($preguntes as $index => $idPregunta) {
    // Agafem la resposta de l'usuari per a la pregunta actual
    $respostaUsuari = $respostesUsuari[$index];

    //executem el statement per cada pregunta (agafem l'id de la pregunta correcte)
    $stmt->bind_param("i", $idPregunta);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();

    // Comprovem si la resposta de l'usuari és correcta
    if ($respostaUsuari == $row['ID_RESPOSTA']) {
        $puntuacio++;
    }
}

//Guardem en una variable $resultat el total de preguntes i les pregutnes correctes de l'usuari
$resultat = [
    "total" => count($preguntes),
    "correctes" => $puntuacio
];

//Eliminem la sessió per poder començar una nova partida
session_destroy();

//Enviem el fitxer de les respostes de l'usuari en format .json
header('Content-Type: application/json');
echo json_encode($resultat);
