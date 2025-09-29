//creem un objecte per guardar l'estat de l'usuari (el nom)
let estatUsuari = {
    nom: null
};

//funcio per iniciar el login (demanat el nom de l'usuari)
function demanarNomUsuari() {
    //agafem el div login i li posem el formulari per demanar el nom
    const loginDiv = document.getElementById("login");
    loginDiv.innerHTML = `
        <h2>Introdueix el teu nom:</h2>
        <input type="text" id="nomUsuari" placeholder="Nom d'usuari">
        <button id="btnEntrar">Entrar</button>
    `;
    //afegim l'event listener al botó d'entrar
    document.getElementById("btnEntrar").addEventListener("click", () => {
        const nom = document.getElementById("nomUsuari").value.trim();
        if(nom){
            estatUsuari.nom = nom;
            localStorage.setItem("usuari", nom);
            loginDiv.innerHTML = ""; //amaguem el div login
            mostrarBenvinguda();
            renderTotesLesPreguntes(totesLesPreguntes); //renderitzem les preguntes
            actualitzarMarcador(); //actualitzem el marcador
        } else {
            alert("CAL INTRODUIR UN NOM!");
        }
    });
}

function mostrarBenvinguda() {
    const h1 = document.getElementById("missatgeBenvinguda");
    h1.textContent = `Benvingut, ${estatUsuari.nom}!`;
}




// Creem un objecte per poder guardar l'estat de la partida
let estatDeLaPartida = {
    contadorPreguntes: 0,//contador de quantes preguntes porta l'usuari
    respostesUsuari : [], //contador (array) de les respostes del usuari
};  
let totesLesPreguntes = [];

// Funció per guardar l'estat de la partida al localStorage
function EsborrarPartida() {
  localStorage.removeItem("partida");
  estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [], // Aquí anirem guardant les respostes 
    tempsRestant:30
  }
  actualitzarMarcador();
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

    //EMMAGATZEMO L'ESTAT DE LA PARTIDA A LOCALSTORAGE
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida))
    console.log(estatDeLaPartida)
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
    actualitzarMarcador();              //Cridem a la funció actualitzarMarcador (per actualitzar el Marcador)
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

        // Afegim les possibles respostes com a botons (estil professor: classe 'btn' i atributs 'preg' i 'resp')
        pregunta.respostes.forEach((resposta, j) => {
            htmlString += `<button class="btn" preg="${i}" resp="${j}">${resposta.resposta}</button><br>`;
        });
        // Afegim una línia horitzontal per separar les preguntes
        htmlString += `<hr>`;
    });

    // Botó de finalitzar inicialment ocult
    htmlString += `<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>`;     
    
    contenidor.innerHTML = htmlString;
    document.getElementById("btnFinalitzar").addEventListener("click", mostrarResultats);
    // detectem botó de resposta per classe 'btn' i atributs 'preg' i 'resp'
    contenidor.addEventListener('click', function (e) {
        console.log("Has fet click a: " + e.target);
        if (e.target.classList.contains('btn')) {
            console.log("Pregunta: " + e.target.getAttribute("preg") + "- Resposta: " + e.target.getAttribute("resp"));
            marcarRespuesta(e.target.getAttribute("preg"), e.target.getAttribute("resp"));
        }
    });
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
            <button class="btn-Reiniciar" id="btnReiniciar">Reiniciar</button>
            `;
            // Hem eliminat l'onclick del botó de Reiniciar
            document.getElementById("btnReiniciar").addEventListener("click", () => {
                // esborrem les dades de localStorage
                localStorage.removeItem("usuari");
                localStorage.removeItem("partida");

                //reinicialitzem les variables globals (usuari i estat de la partida)
                estatUsuari.nom = null;
                estatDeLaPartida = {
                    contadorPreguntes: 0,
                    respostesUsuari: []
                };

                //netegem el contingut de la pàgina 
                contenidor.innerHTML = "";
                let h1Benvinguda = document.getElementById("missatgeBenvinguda");
                if(h1Benvinguda) h1Benvinguda.textContent = "";

                //tornem a demanar el nom del usuari
                demanarNomUsuari();
            });
            console.log(resultat);
        })
}
window.mostrarResultats = mostrarResultats; //mostrem els resultat a la finestra amb la funcio GLOBAL window.

// Funció per carregar la vista d'admin
function carregarAdmin() {
    // amaguem els divs de questionari i marcador
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    // mostrem el div admin on carregarem les preguntes i respostes
    const llistatAdmin = document.getElementById("admin");
    llistatAdmin.style.display = "block";
    fetch('../php/admin/llistatPreguntes.php')
        .then(res => res.json())
        .then(data => {
            // Sincronitzem el dataset global amb el que s'està mostrant a la vista d'admin
            totesLesPreguntes = data.preguntes;
            // Hem eliminat l'onclick dels botons de l'admin
            let htmlString = `<button id="btnTornarEnrere" class="btn-tornar">Tornar enrere</button><br>`;
            // Aquest botó no crida directament, utiltiza event listener que es crida despres
            htmlString += `<button id="btnCrearPregunta" class="btn-crear">Crear nova pregunta</button>`;
            htmlString += `<h2>Llistat complet de preguntes</h2>`;

            data.preguntes.forEach((pregunta, indexPregunta) => {
                htmlString += `<div class="pregunta-admin">
                                <h3>${indexPregunta + 1}. ${pregunta.pregunta}</h3>`;
                pregunta.respostes.forEach(resposta => {
                    htmlString += `<p>- ${resposta.resposta}</p>`;
                });
                htmlString += `<button class="btn-eliminar" data-id="${pregunta.id}">Eliminar</button>`;
                htmlString += `<button class="btn-editar" data-id="${pregunta.id}">Editar</button>`;
                htmlString += `</div><hr>`;
            });
            llistatAdmin.innerHTML = htmlString;
            
            // afegim un event listener contenidor per a tota la vista d'admin contenidor id admin
            llistatAdmin.addEventListener('click', function(e) {
                const target = e.target;
                if (target.id === 'btnTornarEnrere') {
                    window.location.href = 'index.html';
                } else if (target.id === 'btnCrearPregunta') {
                    carregarFormulariCrear();
                } else if (target.classList.contains('btn-eliminar')) {
                    const id = target.getAttribute('data-id');
                    eliminarPregunta(id);
                } else if (target.classList.contains('btn-editar')) {
                    const id = target.getAttribute('data-id');
                    editarPregunta(id);
                }
            });

            document.getElementById("btnCrearPregunta").addEventListener("click", () => {
                //amaguem els altres divs
                document.getElementById("questionari").style.display = "none";
                document.getElementById("marcador").style.display = "none";
                document.getElementById("admin").style.display = "none";

                const crearPreguntaDiv = document.getElementById("crearPregunta");
                crearPreguntaDiv.style.display = "block"; //fem que sigui visible el div crearPRegunta

                crearPreguntaDiv.innerHTML = `
                    <button id="btnTornarEnrereCrear" class="btn-tornar">Enrere</button>
                    <h2>Crear Nova Pregunta</h2>
                    <form id="formCrearPregunta">
                        <label for="preguntaText">Pregunta:</label><br>
                        <input type="text" id="preguntaText" name="preguntaText" required><br><br>

                        <label for="imatgeLink">Link Imatge:</label><br>
                        <input type="text" id="imatgeLink" name="imatgeLink"><br><br>

                        <div id="respostes-container">
                            <label>Respostes:</label><br>
                            <input type="text" name="resposta1" required> <label>Correcta: <input type="radio" name="correcta" value="0" required></label><br>
                            <input type="text" name="resposta2" required> <label>Correcta: <input type="radio" name="correcta" value="1"></label><br>
                            <input type="text" name="resposta3" required> <label>Correcta: <input type="radio" name="correcta" value="2"></label><br>
                            <input type="text" name="resposta4" required> <label>Correcta: <input type="radio" name="correcta" value="3"></label><br>
                        </div>

                        <br>
                        <button type="button" id="btnGuardarPregunta">Guardar Pregunta</button>
                    </form>
                `;
                // Hem eliminat l'onclick del formulari de creació
                document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
                document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
            });
        });
}
window.carregarAdmin = carregarAdmin; //fem la funcio carregarAdmin global per poder trucar-la desde qualsevol lloc

//funcio per eliminar una pregunta
function eliminarPregunta(idPregunta) {
    fetch('../php/admin/eliminarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Normalitzem a número per evitar discrepàncies de tipus amb el backend
        body: JSON.stringify({ id: Number(idPregunta) })
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

// creem la funcio CREARPREGUNTA
function crearPregunta() {
    const form = document.getElementById("formCrearPregunta"); //agafem en un objecte el formulari creat en la funcio renderCrearPregunta
    const preguntaText = form.querySelector('#preguntaText').value; //"" agafemdel cormulari la preguta
    const imatgeLink = form.querySelector('#imatgeLink').value; // "" agafem del fomrulari el link de l'imatge
    //agafem en un array totes les respostes
    const respostes = [ 
        form.querySelector('input[name="resposta1"]').value,
        form.querySelector('input[name="resposta2"]').value,
        form.querySelector('input[name="resposta3"]').value,
        form.querySelector('input[name="resposta4"]').value
    ];
    //guardem en un objecte el correct
    const correctaIndex = form.querySelector('input[name="correcta"]:checked').value;

    // Enviem les dades anteriors al crearPRegunta.php amb fetch
    fetch('../php/admin/crearPreguntes.php', {
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
        //fem que el div crearPregunta s'amagui
        document.getElementById("crearPregunta").style.display = "none";
        carregarAdmin();
    });
}
window.crearPregunta = crearPregunta;

//fem la funcio per editar una pregunta segons quina id li arribi
function editarPregunta(idPregunta) {
    //agafem la variable totesLesPreguntes (que es global) i busquem la pregunta que te la id que ens han passat
    var pregunta = null;
    const idBuscada = Number(idPregunta); // passem a numero per facilitar els seguents processos
    for (var i = 0; i < totesLesPreguntes.length; i++) {
        if (Number(totesLesPreguntes[i].id) === idBuscada) { //si la idbuscada es igual a la id de la pregunta de totes les preguntes
            pregunta = totesLesPreguntes[i];
            break;
            //si trobem la pregunta, sortim del bucle
        }
    }

    // Fem que els altres divs s'amaguin
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";
    document.getElementById("admin").style.display = "none";

    // Agafem el div on carrega el formulari d'editar i el mostrem
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";

    // Construïm el formulari
    let htmlString = `
        <h2>Editar Pregunta</h2>
        <form id="formEditarPregunta">
            <label>Pregunta:</label><br>
            <input type="text" id="editarTextPregunta" value="${pregunta.pregunta}"><br><br>

            <label>Imatge:</label><br>
            <input type="text" id="editarLinkImatge" value="${pregunta.imatge}"><br><br>

            <label>Respostes:</label><br>`;

    pregunta.respostes.forEach((resposta, index) => {
        let checked = "";
        if (resposta.correcta) {
            checked = "checked";
        }
        htmlString += `
            <input type="text" id="resposta${index}" value="${resposta.resposta}">
            <input type="radio" name="correctaEditar" value="${index}" ${checked}> Correcta<br>`;
    });

    htmlString += `<br>
        <button type="button" id="btnGuardarCanvis">Guardar Canvis</button>
        <button type="button" id="btnCancelarEdicio">Cancelar</button>
        </form>`;

    editarDiv.innerHTML = htmlString;
    // afegim els event listeners dels botons d'editar preguntes
    document.getElementById("btnGuardarCanvis").addEventListener("click", () => actualitzarPregunta(idPregunta));
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
}
window.editarPregunta = editarPregunta;

//fem la funcio per actualitzar la pregunta segons quina id li arribi
function actualitzarPregunta(idPregunta) {
    //agafem els valors dels inputs del formulari (preguntaText i imatgeLink)
    const preguntaText = document.getElementById("editarTextPregunta").value;
    const imatgeLink = document.getElementById("editarLinkImatge").value;

    //fem el mateix per les respostes i les guardem en un array (amb un for)
    const respostes = [];
    for (let i = 0; i < 4; i++) {
        //agafem el valor de cada input de resposta i l'afegim a l'array (amb un push)
        respostes.push(document.getElementById(`resposta${i}`).value);
    }

    //agafem l'index de la resposta correcta
    const correctaIndex = document.querySelector('input[name="correctaEditar"]:checked').value;

    //enviem les dades al fitxer php editarPreguntes.php amb fetch
    fetch('../php/admin/editarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            // Normalitzem a número per evitar errors de tipus al PHP
            id: Number(idPregunta),
            pregunta: preguntaText,
            respostes: respostes,
            // Ens assegurem que la correcta sigui un número
            correcta: Number(correctaIndex),
            imatge: imatgeLink
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); //mostrem el missatge que retorna el php
        carregarAdmin(); //recarguem la vista d'admin
        document.getElementById('editarPregunta').style.display = 'none'; //amaguem el div d'editarPregunta
    });
}
window.actualitzarPregunta = actualitzarPregunta; //fem la funcio actualitzarPregunta global per poder trucar-la desde qualsevol lloc


window.addEventListener('DOMContentLoaded', (event) => {
    const usuariGuardat = localStorage.getItem("usuari");
    
    if (usuariGuardat) {
        estatUsuari.nom = usuariGuardat;
        mostrarBenvinguda();

        fetch('../php/getPreguntes.php')
            .then(response => response.json())
            .then(data => {
                totesLesPreguntes = data.preguntes;

                // Comprovem si hi ha una partida guardada
                if (localStorage.partida) {
                    // Carreguem partida guardada
                    estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));

                    // Omplim amb undefined les posicions buides per a preguntes no contestades
                    estatDeLaPartida.respostesUsuari = estatDeLaPartida.respostesUsuari.map(r => r !== null ? r : undefined);

                    // Comptem només les respostes reals
                    estatDeLaPartida.contadorPreguntes = estatDeLaPartida.respostesUsuari.filter(r => r !== undefined).length;
                } else {
                    // No hi ha partida guardada, iniciem una nova
                    estatDeLaPartida = {
                        respostesUsuari: new Array(totesLesPreguntes.length).fill(undefined),
                        contadorPreguntes: 0
                    };
                }

                // Renderitzem preguntes i marcador
                renderTotesLesPreguntes(totesLesPreguntes); 
                actualitzarMarcador();

                // Mostrem botó de finalitzar només si totes les preguntes ja estan respostes
                const btnFinalitzar = document.getElementById("btnFinalitzar");
                if (estatDeLaPartida.contadorPreguntes === totesLesPreguntes.length && btnFinalitzar) {
                    btnFinalitzar.style.display = "inline-block";
                } else if (btnFinalitzar) {
                    btnFinalitzar.style.display = "none";
                }
            });
    } else {
        demanarNomUsuari();
    }

    // Creem botó d'admin
    const btnAdmin = document.createElement("button");
    btnAdmin.textContent = "Admin";
    btnAdmin.className = "btn-admin";
    btnAdmin.id = "btnAdmin";
    document.getElementById("contenidor-principal").appendChild(btnAdmin);
    document.getElementById("btnAdmin").addEventListener("click", carregarAdmin);
});

