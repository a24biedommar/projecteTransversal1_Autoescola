<?php 
session_start();

require_once 'connexio.php';

//condicional per comprovar la connexio amb la base de dades
if (!$conn || $conn->connect_error) {
    die(json_encode(['error' => 'No es pot connectar a la base de dades.']));
}

//agafem el contingut del json enviat des del JS
$json_data = file_get_contents('php://input');
$respostesUsuari = json_decode($json_data, true) ?? []; // utilizem els ?? per assegurar-nos que sigui un array

//comprovem que la sessió de preguntes existeixi
$preguntesSessio = $_SESSION['preguntes'] ?? [];
//si no existeix, retornem error
if (empty($preguntesSessio)) {
    session_destroy();
    die(json_encode(['error' => 'No hi ha dades de partida a la sessió.']));
}

$puntuacio = 0; 

//fem un foreach per recórrer les preguntes de la sessió
foreach ($preguntesSessio as $index => $idPregunta) {
    //si la resposta de l'usuari no existeix, saltem aquesta iteració
    if ($respostesUsuari[$index]) {
        continue;
    }
    
    //la variable $respostaUsuari conte l'ID_RESPOSTA escollit pel JS
    $respostaUsuari = $respostesUsuari[$index];

    //fem la consulta per agafar l'ID_RESPOSTA correcta de la pregunta actual
    $sqlCorrecta = "SELECT ID_RESPOSTA FROM RESPOSTES 
                    WHERE ID_PREGUNTA = $idPregunta AND CORRECTA = 1";
    
    try { // Intentem executar la consulta
        $res = $conn->query($sqlCorrecta);
        
        //comprovem que la consulta s'hagi executat correctament
        if (!$res) {
            continue; // Si la consulta falla, saltem la pregunta.
        }
        
        $row = $res->fetch_assoc();
        
        // Comprovem si la resposta de l'usuari és correcta (si coincideix amb l'ID_RESPOSTA correcta)
        if ((int)$respostaUsuari === (int)$row['ID_RESPOSTA']) {
            $puntuacio++;
        }

    } catch (Throwable $e) {
        // En cas d'excepció de BD, saltem la pregunta i continuem.
        continue;
    }
}

// Resultats que enviarem al front
$resultat = [
    "total" => count($preguntesSessio),
    "correctes" => $puntuacio
];

session_destroy();

header('Content-Type: application/json');
echo json_encode($resultat);
