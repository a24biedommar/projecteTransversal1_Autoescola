<?php
session_start();
require_once '../connexio.php';

header('Content-Type: application/json');

// 1. recollim les dades del formulari
$idPregunta    = (int)($_POST['id'] ?? 0);
$preguntaText  = $_POST['pregunta'] ?? '';
$respostesStr  = $_POST['respostes'] ?? '[]';
$correctaIndex = (int)($_POST['correcta'] ?? -1);

// Descodifiquem l'string JSON de respostes
$respostes = json_decode($respostesStr, true);

// 2. GESTIÓ DE LA PUJADA DEL NOU FITXER
$imatgeRutaBD = ''; 
//fiquem la ruta i el fitxer, si no hi ha fitxer serà null
$targetDir = "../../imatges/"; 
$fitxer = $_FILES['imatge'] ?? null;

if ($fitxer) {
    // Utilitzem el nom original del fitxer (simplicitat màxima)
    $nomOriginal = $fitxer['name'];
    $targetFilePath = $targetDir . $nomOriginal;

    // Movem el fitxer
    move_uploaded_file($fitxer['tmp_name'], $targetFilePath);
    
    $imatgeRutaBD = 'imatges/' . $nomOriginal;
}

// 3. ACTUALITZACIÓ DE LA TAULA PREGUNTES (Sentència COMPLETA)
if (!empty($imatgeRutaBD)) {
    //S'ha pujat una imatge nova -> Actualitzem PREGUNTA I LINK_IMATGE
    $sqlPregunta = "UPDATE PREGUNTES 
                    SET PREGUNTA = '$preguntaTextEsc', 
                        LINK_IMATGE = '$imatgeRutaBD' 
                    WHERE ID_PREGUNTA = '$idPregunta'";
} else {
    //NO s'ha pujat imatge nova -> Només actualitzem PREGUNTA
    $sqlPregunta = "UPDATE PREGUNTES 
                    SET PREGUNTA = '$preguntaTextEsc' 
                    WHERE ID_PREGUNTA = '$idPregunta'";
}
$conn->query($sqlPregunta);

// 4. ACTUALITZACIÓ DE RESPOSTES
$conn->query("DELETE FROM RESPOSTES WHERE ID_PREGUNTA = '$idPregunta'"); // Esborrem les respostes antigues

//Recorrem totes les respostes del fitxer script.js i les inserim una a una
foreach ($respostes as $index => $resposta) {
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    } else {
        $isCorrecta = 0;
    }
    
    //Apliquem addslashes per evitar errors 
    $respostaNeta = addslashes($resposta);

    //inserim la resposta a la base de dades
    $sqlInsert = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) 
                  VALUES ('$idPregunta', '$respostaNeta', '$isCorrecta')";
    $conn->query($sqlInsert);
}

// fem encode per tornar a enviar-li l'informació final al script.js
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes actualitzades correctament']);
