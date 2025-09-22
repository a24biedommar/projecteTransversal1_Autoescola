<?php 
//iniciem la sessió
session_start();

//inicialitzem les variables a 0 per estalbiar-nos errors
$_SESSION['index'] = 0;
$_SESSION['puntuacio'] = 0;
$_SESSION['preguntes'] = [];

//llegim el contingut del fitxer json
$json = file_get_contents("../js/data.json");

//fem decode del fitxer.json per aixi poder tenir en una variable tota l'informació
$preguntes = json_decode($json, true);

// Selecciona 10 preguntes (preguntes al fitxer .json) aleatòries de la variable pregutnes
$preguntesSeleccionades = array_rand($preguntes['preguntes'], 10);

//fem un bucle foreach per tal de guardar en la variable $preguntes les 10 preguntes seleccionades
foreach ($preguntesSeleccionades as $i) {
$_SESSION['preguntes'][] = $preguntes['preguntes'][$i];
}

//declarem la variable (array) on guardarem les preguntes i respostes sense correctIndex
$preguntesNoCorrect = [];

//fem un bucle foreach per tal d'agafar les preguntes (contant els answers, i el correct index)
foreach($_SESSION['preguntes'] as $p){
    $linia = $p;
    
    // Eliminem la clau correcta de cada resposta
    foreach($linia['respostes'] as &$resposta){
        unset($resposta['correcta']);
    }
    
    //un cop hem eliminat de la llista el correctIndex afegim a l'array declarada anteriorment l'informació
    $preguntesNoCorrect[] = $linia;
}

//creem el fitxer json amb les preguntes que mostrarem al usuari
echo json_encode($preguntesNoCorrect);

?>
