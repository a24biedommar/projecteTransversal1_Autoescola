<?php
session_start();
require_once '../connexio.php';

header('Content-Type: application/json');

// 1. Recollim les dades del formulari
$idPregunta    = (int)($_POST['id'] ?? 0);
$preguntaText  = $_POST['pregunta'] ?? '';
$respostesStr  = $_POST['respostes'] ?? '[]';
$correctaIndex = (int)($_POST['correcta'] ?? -1);

// Descodifiquem l'string JSON de respostes
$respostes = json_decode($respostesStr, true);

// 2. GESTIÓ DE LA PUJADA DEL NOU FITXER
$imatgeRutaBD = ''; 
$targetDir = "../../imatges/"; 
$fitxer = $_FILES['imatge'] ?? null;

if ($fitxer && $fitxer['error'] == 0) {
    $nomOriginal = basename($fitxer['name']);
    $targetFilePath = $targetDir . $nomOriginal;

    if (move_uploaded_file($fitxer['tmp_name'], $targetFilePath)) {
        $imatgeRutaBD = 'imatges/' . $nomOriginal;
    }
}

// 3. ACTUALITZACIÓ SEGURA DE LA TAULA PREGUNTES
if (!empty($imatgeRutaBD)) {
    //preparem el statement per actualitzar PREGUNTA i LINK_IMATGE (si s'ha pujat una imatge nova)
    $stmtUpdate = $conn->prepare("UPDATE PREGUNTES SET PREGUNTA = ?, LINK_IMATGE = ? WHERE ID_PREGUNTA = ?");
    //ssi: string, string, integer
    $stmtUpdate->bind_param("ssi", $preguntaText, $imatgeRutaBD, $idPregunta);
} else {
    //si no s'ha pujat imatge, només actualitzem la PREGUNTA
    $stmtUpdate = $conn->prepare("UPDATE PREGUNTES SET PREGUNTA = ? WHERE ID_PREGUNTA = ?");
    //si: string, integer
    $stmtUpdate->bind_param("si", $preguntaText, $idPregunta);
}
$stmtUpdate->execute();
$stmtUpdate->close();


// 4. ACTUALITZACIÓ SEGURA DE LES RESPOSTES
// A. Esborrem les respostes antigues de forma segura
$stmtDelete = $conn->prepare("DELETE FROM RESPOSTES WHERE ID_PREGUNTA = ?");
//i: integer
$stmtDelete->bind_param("i", $idPregunta);
$stmtDelete->execute();
$stmtDelete->close();


// B. Inserim les noves respostes de forma segura
//preparem el statement fora del bucle per no preparar-lo repetidament
$stmtInsert = $conn->prepare("INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) VALUES (?, ?, ?)");

foreach ($respostes as $index => $resposta) {
    //si la pregunta es la correcta, CORRECTA=1, sinó 0
    $isCorrecta = ($index == $correctaIndex) ? 1 : 0;
    
    //isi: integer, string, integer
    $stmtInsert->bind_param("isi", $idPregunta, $resposta, $isCorrecta);
    $stmtInsert->execute();
}
$stmtInsert->close();

// Retornem el missatge d'èxit
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes actualitzades correctament']);

