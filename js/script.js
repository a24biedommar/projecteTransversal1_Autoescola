// Creem un objecte per poder guardar l'estat de la partida
let estatDeLaPartida = {
    contadorPreguntes: 0,//contador de quantes preguntes porta l'usuari
    respostesUsuari : [], //contador (array) de les respostes del usuari
};

// Funció per actualtzar el marcador que es veu en pantalla
function actualitzarMarcador(){
    let marcador = document.getElementById("marcador");  // Agafem l'element HTML on mostrarem el marcador
    //creem un string per anar afegint les preguntes i si s'han respost o no
    let textMarcador = "Preguntes Respostes:<br>";

    // Fem un bucle per recorre les preguntes i veure si s'han respost o no 
    for(let i = 0; i < estatDeLaPartida.respostesUsuari.length; i++){
        
        //Declarem una variable per guardar l'estat de la pregunta
        let estat;

        // Si la resposta de la pregunta i es undefined, vol dir que no s'ha respost
        if (estatDeLaPartida.respostesUsuari[i] === undefined) {
            estat = "O"; // O de "No respost"
        } else {
            estat = "X"; //si s'ha respost, X de "Respost"
        }
        textMarcador += `Pregunta ${i+1}: ${estat}<br>`;
    }

    marcador.innerHTML = textMarcador;
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

     // Guardem la resposta
    estatDeLaPartida.respostesUsuari[numPregunta] = numResposta;

    // Si ja s'han respost totes les preguntes(10), mostrem el botó
    if(estatDeLaPartida.contadorPreguntes === estatDeLaPartida.respostesUsuari.length){
        const btnFinalitzar = document.getElementById("btnFinalitzar");
        if(btnFinalitzar) btnFinalitzar.style.display = "inline-block";
    }

    console.log(estatDeLaPartida);   // Mostrem l'objecte complet de l'estat actual a la consola
    actualitzarMarcador();            //Cridem a la funció actualitzarMarcador (per actualitzar el Marcador)
}

window.marcarRespuesta = marcarRespuesta;

// Funció que crea i mostra el qüestionari al DOM
function renderTotesLesPreguntes(data){
    let contenidor = document.getElementById("questionari"); 
    let htmlString = "";

    data.forEach((pregunta, i) => {
        htmlString += `
            <h3>Pregunta ${i+1}: ${pregunta.pregunta}</h3><br>
            <img src="${pregunta.imatge}" alt="Pregunta ${i+1}"><br>`;

        // Afegim les possibles respostes com a botons
        pregunta.respostes.forEach((resposta, j) => {
            htmlString += `<button class="btn-resposta" onclick="marcarRespuesta(${i}, ${j})">${resposta.resposta}</button><br>`;
        });
        // Afegim una línia horitzontal per separar les preguntes
        htmlString += `<hr>`;
    });

    // Botó de finalitzar inicialment ocult
    htmlString += `<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>`;    
    
    contenidor.innerHTML = htmlString;
    document.getElementById("btnFinalitzar").addEventListener("click", mostrarResultats);

}


// Funció per enviar les respostes a finalitzar.php i mostrar el resultat
function mostrarResultats() {
    // Agafem l'element del marcador per poder ocultar-lo
    let marcador = document.getElementById("marcador");
    if (marcador) { //si existeix el marcador el ocultem
        marcador.style.display = "none";
    }

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
            <button class="btn-Reiniciar" class="btn-Reiniciar" id="btnReiniciar" onclick="window.location.href='index.html'">Reiniciar</button>
        `;
        console.log(resultat);
    })
}
window.mostrarResultats = mostrarResultats; //mostrem els resultat a la finestra amb la funcio GLOBAL window.

// Esperem que el DOM estigui carregat abans d'executar el codi
window.addEventListener('DOMContentLoaded', (event) => {
    // Fem fetch del fitxer getPreguntes.php amb les preguntes (sense correctIndex)
    fetch('../php/getPreguntes.php')
        .then(response => response.json())
        .then(data => {
            let preg = data.preguntes; // agafem la clau 'preguntes'
            estatDeLaPartida.respostesUsuari = new Array(preg.length).fill(undefined);
            renderTotesLesPreguntes(preg);
            actualitzarMarcador();
        });
});
