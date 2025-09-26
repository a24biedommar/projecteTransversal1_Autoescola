<?php
//iniciem la sessió
session_start();

header('Content-Type: application/json');

//rebem les dades del fetch i les decodifiquem en una variable $docu
$docu = json_decode(file_get_contents('php://input'), true);

// Anomenem les variables per agafar les dades del JSON (amb valors per defecte)
$idPregunta    = isset($docu['id']) ? (int)$docu['id'] : 0;
$preguntaText  = isset($docu['pregunta']) ? $docu['pregunta'] : '';
$imatge        = isset($docu['imatge']) ? $docu['imatge'] : '';
$respostes     = isset($docu['respostes']) && is_array($docu['respostes']) ? $docu['respostes'] : [];
$correctaIndex = isset($docu['correcta']) ? (int)$docu['correcta'] : -1;

//fem la connexió a la base de dades
$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset('utf8mb4');
if ($conn->connect_error) {
    echo json_encode(['success'=>false,'message'=>'Error de connexió','error'=>$conn->connect_error]);
    exit;
}

//fem la query per actualitzar la pregunta
// Escape de cadenes per seguretat i per evitar errors de sintaxi
$preguntaTextEsc = $conn->real_escape_string($preguntaText);
$imatgeEsc       = $conn->real_escape_string($imatge);

$sqlPregunta = "UPDATE PREGUNTES 
                SET PREGUNTA = '$preguntaTextEsc', LINK_IMATGE = '$imatgeEsc' 
                WHERE ID_PREGUNTA = '$idPregunta'";
if (!$conn->query($sqlPregunta)) {
    echo json_encode(['success'=>false,'message'=>'Error actualitzant la pregunta','error'=>$conn->error]);
    $conn->close();
    exit;
}

// Reemplaçem les respostes: eliminem les existents i inserim les noves
if (!$conn->query("DELETE FROM RESPOSTES WHERE ID_PREGUNTA = '$idPregunta'")) {
    echo json_encode(['success'=>false,'message'=>'Error eliminant respostes anteriors','error'=>$conn->error]);
    $conn->close();
    exit;
}

foreach ($respostes as $index => $resposta) {
    $isCorrecta = ($index === $correctaIndex) ? 1 : 0;
    $resEsc = $conn->real_escape_string($resposta);
    $sqlInsert = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) 
                  VALUES ('$idPregunta', '$resEsc', '$isCorrecta')";
    if (!$conn->query($sqlInsert)) {
        echo json_encode(['success'=>false,'message'=>'Error inserint resposta','error'=>$conn->error]);
        $conn->close();
        exit;
    }
}

// Retornem missatge d’èxit
echo json_encode(['success'=>true,'message'=>'Pregunta i respostes actualitzades correctament']);

$conn->close();
?>
