<?php
header('Content-Type: application/json');

//decodifiquem les dades del fitxer json que ens arriva del script
$docu = json_decode(file_get_contents('php://input'), true);

//seguit creem variables del fitxer json que ens ha arribat
$idPregunta = $docu['id'];
$novaPregunta = $docu['pregunta'];
$novesRespostes = $docu['respostes'];
$idRespostaCorrecta = $docu['idRespostaCorrecta'];

//fem la connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);

//Fem la query per poder fer update de les preguntes
$conn->query("UPDATE PREGUNTES SET PREGUNTA = '$novaPregunta' WHERE ID_PREGUNTA = $idPregunta");

//Recorrem les respostes amb un bucle foreach per anar actualitantles
foreach ($novesRespostes as $resposta) {
    //creem la variable per marcar si es correcte o incorrecte la resposta
    $correcta = 0;
    
    //si l'ID de la resposta es correcte (esta marcada com a checked) cambiem la variable correcta per 1
    //si no seguira sent 0 es a dir incorrecte
    if ($resposta['id'] == $idRespostaCorrecta) {
        $correcta = 1;
    }
    
    // Actualitzem cada resposta a la base de dades
    $conn->query("UPDATE RESPOSTES SET RESPOSTA = '{$resposta['resposta']}', CORRECTA = $correcta WHERE ID_RESPOSTA = {$resposta['id']}");
}

// Retornem una resposta simple de confirmació en format JSON
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes actualitzades correctament']);

$conn->close();
?>