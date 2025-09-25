// Creem un objecte per poder guardar l'estat de la partida
let estatDeLaPartida = {
    contadorPreguntes: 0,//contador de quantes preguntes porta l'usuari
    respostesUsuari : [], //contador (array) de les respostes del usuari
};  

// Funció per actualtzar el marcador que es veu en pantalla
function actualitzarMarcador(){
    let marcador = document.getElementById("marcador");  // Agafem l'element HTML on mostrarem el marcador
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
    estatDeLaPartida.respostesUsuari[numPregunta] =  numResposta;

    // Si ja s'han respost totes les preguntes(10), mostrem el botó
    if(estatDeLaPartida.contadorPreguntes === estatDeLaPartida.respostesUsuari.length){
        const btnFinalitzar = document.getElementById("btnFinalitzar");
        if(btnFinalitzar) btnFinalitzar.style.display = "inline-block";
    }

    console.log(estatDeLaPartida);   // Mostrem l'objecte complet de l'estat actual a la consola
    actualitzarMarcador();            //Cridem a la funció actualitzarMarcador (per actualitzar el Marcador)
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
            let htmlString = `<button id="btnTornarEnrere" class="btn-tornar" onclick="window.location.href='index.html'">Tornar enrere</button>`;
            htmlString = `<button id="btnCrearPregunta" class="btn-crear" onclick="renderCrearPregunta()">Crear nova pregunta</button>`;
            htmlString += `<h2>Llistat complet de preguntes</h2>`;
            
            data.preguntes.forEach((pregunta, indexPregunta) => {
                htmlString += `<div class="pregunta-admin">
                                <h3>${indexPregunta + 1}. ${pregunta.pregunta}</h3>`;
                pregunta.respostes.forEach(resposta => {
                    htmlString += `<p>- ${resposta.resposta}</p>`;
                });
                // Afegim el botó d'eliminar amb la funció eliminarPregunta
                htmlString += `<button class="btn-eliminar" onclick="eliminarPregunta(${pregunta.id})">Eliminar</button>`;
                
                // Afegim el botó d'editar amb la funció editarPregunta 
                htmlString += `<button class="btn-editar" onclick="editarPregunta(${pregunta.id})">Editar</button>`;
                
                //tancem el div de la pregunta i afegim una línia horitzontal
                htmlString += `</div><hr>`;
            });
            
            llistatAdmin.innerHTML = htmlString;

            llistatAdmin.style.display = "block"; // Mostrem el div admin
        });
}

function eliminarPregunta(idPregunta) {
    fetch('../php/admin/eliminarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idPregunta })
    })
    .then(res => res.json())
    .then(resp => {
        // Mostrem el missatge que retorna el PHP (conforme s'ha eliminat)
        alert(resp.message);
        //si hem pogut eliminar mostrem el missatge i despres recarreguem la vista d'admin
        carregarAdmin();
    });
}
//TODO: No cal fer la funcio eliminarPregunta global, ja que es crida des de dins de carregarAdmin
window.eliminarPregunta = eliminarPregunta; //fem la funcio eliminarPregunta global per poder trucar-la desde qualsevol lloc

//CREEM LA FUNCIO RENDERCCREARPREGUNTA PER AIXI FER EL FORMULARI DE CREACIÓ DE PREGUTNES
function renderCrearPregunta() {
    //amaguem els altres divs
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";
    document.getElementById("admin").style.display = "none";

    const crearPreguntaDiv = document.getElementById("crearPregunta");
    crearPreguntaDiv.style.display = "block"; //fem que sigui visible el div crearPRegunta

    crearPreguntaDiv.innerHTML = `
        <button id="btnTornarEnrere" class="btn-tornar" onclick="carregarAdmin()">Enrere</button>
        <h2>Crear Nova Pregunta</h2>
        <form id="formCrearPregunta">
            <label for="preguntaText">Pregunta:</label><br>
            <input type="text" id="preguntaText" name="preguntaText" required><br><br>

            <label for="imatgeLink">Link Imatge:</label><br>
            <input type="text" id="imatgeLink" name="imatgeLink"><br><br>

            <div id="respostes-container">
                <label>Respostes:</label><br>
                //fem que el primer input sigui required ja que com pertañen al mateix grup nomes cal ficar-ho un cop
                <input type="text" name="resposta1" required> <label>Correcta: <input type="radio" name="correcta" value="0" required></label><br>
                <input type="text" name="resposta2" required> <label>Correcta: <input type="radio" name="correcta" value="1"></label><br>
                <input type="text" name="resposta3" required> <label>Correcta: <input type="radio" name="correcta" value="2"></label><br>
                <input type="text" name="resposta4" required> <label>Correcta: <input type="radio" name="correcta" value="3"></label><br>
            </div>

            <br>
            <button type="button" onclick="crearPregunta()">Guardar Pregunta</button>
        </form>
    `;
}

// creem la funcio CREARPREGUNTA
function crearPregunta() {
    const form = document.getElementById("formCrearPregunta"); //agafem en un objecte el formulari creat en la funcio renderCrearPregunta
    const preguntaText = form.querySelector('#preguntaText').value; //"" agafemdel cormulari la preguta
    const imatgeLink = form.querySelector('#imatgeLink').value; // "" agafem del fomrulari el link de l'imatge
    const respostes = [ //agafem en un array totes les respostes
        form.querySelector('input[name="resposta1"]').value,
        form.querySelector('input[name="resposta2"]').value,
        form.querySelector('input[name="resposta3"]').value,
        form.querySelector('input[name="resposta4"]').value
    ];
    //guardem en un objecte el correct
    const correctaIndex = form.querySelector('input[name="correcta"]:checked').value;

    // Enviem les dades anteriors al crearPRegunta.php amb fetch
    fetch('../php/admin/crearPregunta.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ //passem a string les variables anteriors
            pregunta: preguntaText,
            respostes: respostes,
            correcta: correctaIndex,
            imatge: imatgeLink
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); //mostrem el missatge del fitxar crearPreguntes.php i seguit carreguem un altre cop la feed del admin
        carregarAdmin();
    });
}

let  totesLesPreguntes = [];

// Esperem que el DOM estigui carregat abans d'executar el codi
window.addEventListener('DOMContentLoaded', (event) => {
    // FETCH DEL QUESTIONARI
    fetch('../php/getPreguntes.php')
        .then(response => response.json()) // Convertim la resposta a objecte JSON
        .then(data => {
            totesLesPreguntes = data.preguntes;
            // Inicialitzem l'array de respostes amb tants elements com preguntes
            estatDeLaPartida.respostesUsuari = new Array(totesLesPreguntes.length).fill(undefined);
            renderTotesLesPreguntes(totesLesPreguntes);   // Cridem la funció per renderitzar el joc amb les dades
            actualitzarMarcador();           // Mostrem el marcador des del principi
        });

    //CREEM EL BOTÓ D'ADMIN
    const btnAdmin = document.createElement("button");
    btnAdmin.textContent = "Admin";
    btnAdmin.className = "btn-admin";
    btnAdmin.id = "btnAdmin";
    document.getElementById("contenidor-principal").appendChild(btnAdmin);
    document.getElementById("btnAdmin").addEventListener("click", carregarAdmin);

});