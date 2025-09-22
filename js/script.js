// Creem un objecte per poder guardar l'estat de la partida
let estatDeLaPartida = {
    contadorPreguntes: 0,//contador de quantes preguntes porta l'usuari
    respostesUsuari : [], //contador (array) de les respostes del usuari
    preguntaActual: 0  //contador de a quina pregunta actual
};

// Funció per actualtzar el marcador que es veu en pantalla
function actualitzarMarcador(){
    let marcador = document.getElementById("marcador");  // Agafem l'element HTML on mostrarem el marcador
    //modifiquem el contingut del marcador amb les pregutnes i respostes del usuari
    marcador.innerHTML = `Pregunta actual: ${estatDeLaPartida.preguntaActual + 1}`;
}

//Assignem la funcio actualtizarMarcador al objecte global window, per poder trucar-la desde qualsevol lloc
window.actualitzarMarcador = actualitzarMarcador;

//Fem la funcio marcarResposta per marcar les respostes del usuari
function marcarRespuesta(numPregunta, numResposta) {
    //Mostrem per consola quina pregunta i resposta s'ha seleccionat
    console.log("Pregunta " + numPregunta + " Resposta " + numResposta); 

    // si la pregunta no s'ha respos es suma si s'ha respos no es suma (al contador de preguntes)
    if (estatDeLaPartida.respostesUsuari[numPregunta] === undefined) {
        estatDeLaPartida.contadorPreguntes++;
    }

    //Guardem la resposta de l'usuari dins l'array de respostes, en la posició de la pregunta
    estatDeLaPartida.respostesUsuari[numPregunta] =  numResposta;

    console.log(estatDeLaPartida);   // Mostrem l'objecte complet de l'estat actual a la consola
    actualitzarMarcador();            //Cridem a la funció actualitzarMarcador (per actualitzar el Marcador)
}

window.marcarRespuesta = marcarRespuesta;

// Funció que crea i mostra el qüestionari al DOM
function renderPregunta(data){
    let contenidor = document.getElementById("questionari"); // Agafem l'element on posarem les preguntes (element amb id questionari)
    let i = estatDeLaPartida.preguntaActual; //index de la pregunta la qual mostrem
    //agafem la pregunta de l'array que ve directament del PHP sense els correctIndex
    let pregunta = data[i]; //guardem les preguntes del index

    //mostrem el index de la pregunta, despres la pregunta, i despres l'imatge
    let htmlString = `<h3>${pregunta.pregunta}</h3>
        <img src="${pregunta.imatge}" alt="Pregunta ${i+1}"><br>`;

    //fem un per mostrar les 4 possibles respostes
    for(let j = 0; j < pregunta.respostes.length; j++){
        htmlString += `<button class="btn-resposta" onclick="marcarRespuesta(${i}, ${j})">${pregunta.respostes[j].resposta}</button><br>`;
    }

    //si encara queden pregutnes mostrem el botó seguent si no queden preguntes mostrem el botó de finalitzar
    if (i < data.length - 1){
        htmlString += `<br><button class="btn-seguent" id="btnSeguent">Següent</button>`; 
    } else {
        //botó "Finalitzar" que crida a mostrarResultats per enviar les respostes al PHP (finalitzar.php)
        htmlString += `<br><button class="btn-finalitzar" onclick="mostrarResultats()">Finalitzar</button>`;
    }
    contenidor.innerHTML = htmlString;

    let btn = document.getElementById("btnSeguent"); 
    if(btn){
        btn.addEventListener("click", () => {
            estatDeLaPartida.preguntaActual++;   //si el botó seguent es clica sumem un a la pregunta acutal (cambiem de index)
            renderPregunta(data);                //un cop clicat, tornem a renderizar una nova pregunta
        });
    }

    actualitzarMarcador(); //despreés de tot aquest proces acutalitzem el marcador
}

// Funció per enviar les respostes a finalitzar.php i mostrar el resultat
function mostrarResultats() {
    fetch('../php/finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estatDeLaPartida.respostesUsuari)
    })
    .then(response => response.json())
    .then(resultat => {
        let contenidor = document.getElementById("questionari");
        // Mostrem els resultats a l'usuari
        contenidor.innerHTML = `
            <h2>Resultats</h2>
            <p>Total preguntes: ${resultat.total}</p>
            <p>Correctes: ${resultat.correctes}</p>
        `;
        console.log(resultat);
    })
}
window.mostrarResultats = mostrarResultats; //mostrem els resultat a la finestra amb la funcio GLOBAL window.

// Esperem que el DOM estigui carregat abans d'executar el codi
window.addEventListener('DOMContentLoaded', (event) => {
    // Fem fetch del fitxer getPreguntes.php amb les preguntes (sense correctIndex)
    fetch('../php/getPreguntes.php')
        .then(response => response.json()) // Convertim la resposta a objecte JSON
        .then(preg => renderPregunta(preg));   // Cridem la funció per renderitzar el joc amb les dades
    }
);
