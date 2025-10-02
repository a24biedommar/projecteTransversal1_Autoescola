<?php
session_start();
require_once '../connexio.php';
header('Content-Type: application/json');

// 1. Recollim les dades del formulari si no hi ha valor posem un valor per defecte
$idPregunta    = (int)($_POST['id'] ?? 0);
$preguntaText  = $_POST['pregunta'] ?? '';
$respostesStr  = $_POST['respostes'] ?? '[]';
$correctaIndex = (int)($_POST['correcta'] ?? -1);

$respostes = json_decode($respostesStr, true);

// 2. Declarem les variables de l'imatge (directori objectiu i ruta a la BD)
$imatgeRutaBD = ''; 
$targetDir = "../imatges/"; // Carpeta de destinació
$fitxer = $_FILES['imatge'] ?? null;

if ($fitxer) {
    // guardem el nom original del fitxer i la ruta completa
    $nomOriginal = $fitxer['name'];
    $targetFilePath = $targetDir . $nomOriginal;

    // Movem el fitxer
    move_uploaded_file($fitxer['tmp_name'], $targetFilePath);
    
    // si s'ha pujat una imatge, preparem la ruta per a la BD
    $imatgeRutaBD = 'imatges/' . $nomOriginal;
}

// 3. ACTUALITZACIÓ DE LA TAULA PREGUNTES
$sqlPregunta = "UPDATE PREGUNTES 
                SET PREGUNTA = '$preguntaTextEsc'"; // Afegim el camp PREGUNTA a l'UPDATE

if (!empty($imatgeRutaBD)) {
    // si hi ha imatge nova, actualitzem també el camp LINK_IMATGE
    $sqlPregunta = "UPDATE PREGUNTES 
                    SET PREGUNTA = '$preguntaTextEsc', 
                        LINK_IMATGE = '$imatgeRutaBD' 
                    WHERE ID_PREGUNTA = '$idPregunta'";
} else {
    //si no hi ha imatge nova, només actualitzem la pregunta
    $sqlPregunta = "UPDATE PREGUNTES 
                    SET PREGUNTA = '$preguntaTextEsc' 
                    WHERE ID_PREGUNTA = '$idPregunta'";
}


//4. ACTUALITZACIÓ DE RESPOSTES
$conn->query("DELETE FROM RESPOSTES WHERE ID_PREGUNTA = '$idPregunta'");

//recorrem totes les preguntes i les inserim de nou (actualitzant també la correcta)
foreach ($respostes as $index => $resposta) {
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    } else {
        $isCorrecta = 0;
    }
        
    //inserim la resposta a la base de dades
    $sqlInsert = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) 
                  VALUES ('$idPregunta', '$resposta', '$isCorrecta')";
    $conn->query($sqlInsert);
}

//fem encode per enviarli al script la informació
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes actualitzades correctament']);


