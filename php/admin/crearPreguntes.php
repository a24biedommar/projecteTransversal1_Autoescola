<?php
session_start();
require_once '../connexio.php';

header('Content-Type: application/json');

// 1. Recollim les dades del formulari de tipo text, si no hi ha valor posem un valor per defecte
$preguntaText = $_POST['pregunta'] ?? '';
$respostesStr = $_POST['respostes'] ?? '[]'; 
$correctaIndex = (int)($_POST['correcta'] ?? -1);

$respostes = json_decode($respostesStr, true);

// 2. Declarem les variables de l'imatge (directori objectiu i ruta a la BD)
$imatgeRutaBD = '';
$targetDir = "../imatges/";
$fitxer = $_FILES['imatge'] ?? null;

//3. Si hi ha fitxer, el processem
if ($fitxer) {
    //1. Guardem el nom original del fitxer
    $nomOriginal = $fitxer['name'];
    
    //2. Construim la ruta completa on es guardarà el fitxer
    $targetFilePath = $targetDir . $nomOriginal;

    //3. movem el fitxer al directori objectiu
    move_uploaded_file($fitxer['tmp_name'], $targetFilePath); 
    
    //4. Construim la ruta que es guardarà a la BD
    $imatgeRutaBD = 'imatges/' . $nomOriginal; 
}

// 4. INSERCIÓ A LA BASE DE DADES
//A. fem el select per agafar el id de la pregunta
$sqlId = "SELECT MAX(ID_PREGUNTA) + 1 FROM PREGUNTES";
$result = $conn->query($sqlId);
$row = $result->fetch_row();
$id_pregunta = $row[0];

//B. Inserim la pregunta a la taula 'PREGUNTES'
$sqlPregunta = "INSERT INTO PREGUNTES (ID_PREGUNTA, PREGUNTA, LINK_IMATGE) VALUES ('$id_pregunta','$preguntaText', '$imatgeRutaBD')";
$conn->query($sqlPregunta);


//Inserim les respostes a la taula 'RESPOSTES'
foreach ($respostes as $index => $resposta) {
    $isCorrecta = 0;
    if ($index == $correctaIndex) {
        $isCorrecta = 1;
    }
    
    //A. Contruim la query d'inserció
    $sqlResposta = "INSERT INTO RESPOSTES (ID_PREGUNTA, RESPOSTA, CORRECTA) VALUES ('$id_pregunta', '$resEsc', '$isCorrecta')";
    
    //B. Executem la query si falla mostrem error
    $conn->query($sqlResposta) or die("Error en la consulta de resposta: " . mysqli_error($conn));
}

// 5. Retornem una resposta JSON d'èxit
echo json_encode(['success' => true, 'message' => 'Pregunta i respostes creades correctament']);
