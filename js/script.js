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
function renderTotesLesPreguntes(preguntes){
    let contenidor = document.getElementById("questionari"); 
    let htmlString = "";

    preguntes.forEach((pregunta, i) => {
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

// Funció per carregar la vista d'admin
function carregarAdmin() {
    // amaguem els divs de questionari i marcador
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";

    // mostrem el div admin on carregarem les preguntes i respostes
    const llistatAdmin = document.getElementById("admin");

    fetch('../php/admin/llistatPreguntes.php')
        .then(res => res.json())
        .then(data => {
            // Creem el llistat de preguntes i respostes
            let htmlString = `<h2>Llistat complet de preguntes</h2>`;
            
            data.preguntes.forEach((pregunta, indexPregunta) => {
                htmlString += `<div class="pregunta-admin">
                                <h3>${indexPregunta + 1}. ${pregunta.pregunta}</h3>`;
                pregunta.respostes.forEach(resposta => {
                    htmlString += `<p>- ${resposta.resposta}</p>`;
                });
                // Afegim el botó d'eliminar amb la funció eliminarPregunta
                htmlString += `<button class="btn-eliminar" onclick="eliminarPregunta(${pregunta.id})">Eliminar</button>`;
                
                //tancem el div de la pregunta i afegim una línia horitzontal
                htmlString += `</div><hr>`;
            });
            
            htmlString += `<button id="btnTornarEnrere" class="btn-tornar" onclick="window.location.href='index.html'">Tornar enrere</button>`;

            llistatAdmin.innerHTML = htmlString;

            llistatAdmin.style.display = "block"; // Mostrem el div admin
        });
}

function eliminarPregunta(idPregunta) {
    // Petició POST al PHP per eliminar la pregunta
    fetch('../php/admin/eliminarAdmin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${idPregunta}`
    })
    .then(res => res.json())
    .then(resp => {
        if (resp.success) {
            carregarAdmin(); // Recarreguem la vista d'admin
        }
    });
}



// Esperem que el DOM estigui carregat abans d'executar el codi
window.addEventListener('DOMContentLoaded', (event) => {
    // FETCH DEL QUESTIONARI
    fetch('../php/getPreguntes.php')
        .then(response => response.json()) // Convertim la resposta a objecte JSON
        .then(data => {
            const preguntes = data.preguntes;
            // Inicialitzem l'array de respostes amb tants elements com preguntes
            estatDeLaPartida.respostesUsuari = new Array(preguntes.length).fill(undefined);
            renderTotesLesPreguntes(preguntes);   // Cridem la funció per renderitzar el joc amb les dades
            actualitzarMarcador();           // Mostrem el marcador des del principi
        });

    //CREEM EL BOTÓ D'ADMIN
    const btnAdmin = document.createElement("button");
    btnAdmin.textContent = "Admin";
    btnAdmin.className = "btn-admin";
    btnAdmin.id = "btnAdmin";
    document.getElementById("contenidor-principal").appendChild(btnAdmin);
    document.getElementById("btnAdmin").addEventListener("click", carregarAdmin);

});
