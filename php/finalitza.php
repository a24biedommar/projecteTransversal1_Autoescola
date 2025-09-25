<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//iniciem la sessió
session_start();

// Connexió DB
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@"; 
$dbname = "a24biedommar_Projecte0"; 
$conn = new mysqli($servername, $username, $password, $dbname);

// decodifiquem el fitxer json que ha generat el script de index.html (enviat per petició http)
$json_data = file_get_contents('php://input');
$respostesUsuari = json_decode($json_data, true);

//creem les variables seguents:
$preguntes = $_SESSION['preguntes']; //agafem les preguntes que s'han mostrat a index.html
$puntuacio = 0; //inicialitzem la puntuació del usuari

// Recorrem les respostes de l'usuari i les comparemm amb les correctes
foreach ($preguntes as $index => $idPregunta) {
    // Agafem la resposta de l'usuari per a la pregunta actual
    $respostaUsuari = $respostesUsuari[$index];

    //Fem la consulta select per agafar la resposta correcta de la BD
    $sqlCorrecta = "SELECT ID_RESPOSTA FROM RESPOSTES 
                    WHERE ID_PREGUNTA = $idPregunta AND ES_CORRECTA = 1";
    $res = $conn->query($sqlCorrecta);
    $row = $res->fetch_assoc();

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
?>