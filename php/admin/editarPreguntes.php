<?php
//iniciem sessio
session_start();

header('Content-Type: application/json');

//fem un decode del fitxer json que ens arriba i d'aquest el guardem a la variable docu
$docu = json_decode(file_get_contents('php://input'), true);

//agafem els camps que ens arriva del script.js
$idPregunta    = (int)$docu['id'];
$preguntaText  = $docu['pregunta'];
$imatge        = $docu['imatge'];
$respostes     = $docu['respostes'];
$correctaIndex = (int)$docu['correcta'];

// Connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);$conn->set_charset('utf8mb4');

//Fem que tot el contngut d'aquestes dues variables sigui "net"
// es a dir fem que sigui tot un stringper evitar errors
$preguntaTextEsc = $conn->real_escape_string($preguntaText);
$imatgeEsc       = $conn->real_escape_string($imatge);

// actualitzem la taula PREGUNTES amb el nou text i el link de la imatge
$sqlPregunta = "UPDATE PREGUNTES 
                SET PREGUNTA = '$preguntaTextEsc', LINK_IMATGE = '$imatgeEsc' 
                WHERE ID_PREGUNTA = '$idPregunta'";
$conn->query($sqlPregunta);

// eliminem totes les respostes actuals d'aquesta pregunta per tornar-les a inserir (mes endavant)
$conn->query("DELETE FROM RESPOSTES WHERE ID_PREGUNTA = '$idPregunta'");

//Recorrem totes les respostes del fitxer script.js i les inserim
foreach ($respostes as $index => $resposta) {
    //si es correcta (es el index de la correcta) marquem com a 1 si no com a 0
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    } else {
        $isCorrecta = 0;
    }
    //netejem com avanc la variable resposta per evitar errors
    $resEsc = $conn->real_escape_string($resposta);
    //inserim la resposta a la base de dades
    $sqlInsert = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) 
                  VALUES ('$idPregunta', '$resEsc', '$isCorrecta')";
    $conn->query($sqlInsert);
}

// fem encode per tornar a enviar-li l'informació final al script.js
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes actualitzades correctament']);

// Tanquem la connexió
$conn->close();
?>