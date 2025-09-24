<?php 
//linia de prova per el commit and push
//iniciem la sessió
session_start();

// decodifiquem el fitxer json que ha generat el script de index.html (enviat per petició http)
$json_data = file_get_contents('php://input');
$respostesUsuari = json_decode($json_data, true);

//creem les variables seguents:
$preguntes = $_SESSION['preguntes']; //agafem les preguntes que s'han mostrat a index.html
$puntuacio = 0; //inicialitzem la puntuació del usuari

// Recorrem les respostes de l'usuari i les comparem
foreach ($respostesUsuari as $index => $respostaUsuari) {
    //si la resposta de la pregunta del index on està el foreach és igual al correctIndex sumem 1 a la puntuació
    if ($respostesUsuari[$index] == $preguntes[$index]['correctIndex']) {
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
?>