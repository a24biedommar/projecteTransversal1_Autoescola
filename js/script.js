//-----------------------------
// VARIABLES GLOBALS!!
//-----------------------------
let estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [], // Array on guardem la resposta seleccionada per a cada pregunta (índex de la resposta)
};
// Variable per emmagatzemar el nom de l'usuari
let nomUsuari = "";
// Array per emmagatzemar totes les preguntes carregades des del servidor
let totesLesPreguntes = [];

//-----------------------------
// FUNCIONS DE MOSTRAR I GESTIONAR EL JOC I EL LOGIN
//-----------------------------

//-------------------------
// FUNCIO QUE GESTIONA EL MOSTRAR EL LOGIN I EMMAGATZEMA EL NOM DE L'USUARI
function mostrarLogin() {
    // 1. Amaguem totes les vistes menys el login
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";
    document.getElementById("admin").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    
    const loginDiv = document.getElementById("login");
    
    // 2. Netejem l'estat de la partida i el nom d'usuari de localStorage
    localStorage.removeItem("partida");
    localStorage.removeItem("nomUsuari");
    nomUsuari = "";

    // 3. Generem i mostrem el formulari de login
    loginDiv.innerHTML = `
        <h2>Inici de Sessió</h2>
        <form id="loginForm">
            <label for="username">Introdueix el teu nom:</label><br>
            <input type="text" id="username" name="username" required><br><br>
            <button type="submit" id="btnLogin">Entrar</button>
        </form>
    `;
    loginDiv.style.display = "block";
    
    // 4. Afegim l'event listener al formulari (botó entrar)
    const formLogin = document.getElementById("loginForm");
    if (formLogin) {
        formLogin.addEventListener("submit", gestionarLogin);
    }
    
    // 5. Actualitzem el missatge de benvinguda i amaguem el botó admin
    document.getElementById("missatgeBenvinguda").textContent = "Qüestionari Autoescola";
    const btnAdmin = document.getElementById("btnAdmin");
    if (btnAdmin) btnAdmin.style.display = "none";
}

//-------------------------
// FUNCIO QUE GESTIONA EL LOGIN
function gestionarLogin(event) {
    // 1. Evitem que el formulari s'envii (evita el refresh de la pàgina)
    event.preventDefault(); 
    
    // 2. Agafem el nom introduït
    const inputNom = document.getElementById("username");
    const nomIntroduit = inputNom.value;
    
    // 3. Si s'ha introduït un nom, l'emmagatzemem i carreguem el joc
    if (nomIntroduit) {
        nomUsuari = nomIntroduit;
        localStorage.setItem("nomUsuari", nomUsuari);
        
        // 4. Amaguem el login i iniciem la càrrega del joc
        document.getElementById("login").style.display = "none";
        carregarJoc();
    }
}

//-------------------------
// FUNCIO QUE CARREGA EL JOC
function carregarJoc() {
    // 1. Si existeix la partida al localstorage, la carreguem
    if (localStorage.partida) {
        estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));
    } else {
        // Reiniciem l'estat si no hi ha partida guardada
        estatDeLaPartida = {
            preguntaActual: 0,
            contadorPreguntes: 0,
            respostesUsuari: [],
        };
    }

    // 2. Carreguem les preguntes fent un fetch al servidor
    fetch('../php/getPreguntes.php')
        .then(response => response.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            // Si és la primera càrrega, inicialitzem l'array de respostes
            if (estatDeLaPartida.respostesUsuari.length !== totesLesPreguntes.length) {
                estatDeLaPartida.respostesUsuari = new Array(totesLesPreguntes.length).fill(undefined);
            }

            // 3. Truquem a les funcions per renderitzar les preguntes i actualitzar el marcador
            renderTotesLesPreguntes(totesLesPreguntes); 
            actualitzarMarcador(); 
            
            // 4. Finalment mostrem la vista del joc
            mostrarJoc();
        });
}

//-------------------------
// FUNCIO QUE MOSTRA LA VISTA DEL JOC (QUESTIONARI I MARCADOR)
function mostrarJoc() {
    // 1. Amaguem el login i mostrem el questionari i el marcador
    document.getElementById("login").style.display = "none";
    document.getElementById("questionari").style.display = "block";
    document.getElementById("marcador").style.display = "block";
    document.getElementById("admin").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    
    // 2. Mostrem el missatge de benvinguda amb el nom de l'usuari 
    document.getElementById("missatgeBenvinguda").textContent = `Benvingut ${nomUsuari}!`;
    
    // 3. Si existeix el botó admin, el mostrem
    const btnAdmin = document.getElementById("btnAdmin");
    if (btnAdmin) btnAdmin.style.display = "inline-block";
}


//--------------------------
// FUNCIONS QUE GESTIONEN EL QÜESTIONARI I LES PREGUNTES
//--------------------------

//-------------------------
// FUNCIO QUE MARCA LA RESPOSTA SELECCIONADA PER L'USUARI I ACTUALITZA L'ESTAT DE LA PARTIDA
function marcarResposta(numPregunta, numResposta) {
    const preguntaIndex = parseInt(numPregunta);
    const respostaIndex = parseInt(numResposta);

    // 1. Si la pregunta no estava contestada, incrementem el comptador
    if (estatDeLaPartida.respostesUsuari[preguntaIndex] === undefined) {
        estatDeLaPartida.contadorPreguntes++;
    }

    // 2. Guardem la resposta de l'usuari
    estatDeLaPartida.respostesUsuari[preguntaIndex] = respostaIndex;

    // 3. Actualitzem la visualització
    actualitzarMarcador();
}

//-------------------------
// FUNCIÓ QUE CREA I RENDERITZA LES PREGUNTES DEL QÜESTIONARI A L'HTML.
function renderTotesLesPreguntes(preguntes) {
    const contenidor = document.getElementById("questionari");
    let htmlString = "";

    // 1. Iterem sobre totes les preguntes per generar el codi HTML
    preguntes.forEach((pregunta, i) => {
        htmlString += `<h3>Pregunta ${i + 1}: ${pregunta.pregunta}</h3><br>`;
        htmlString += `<img src="${pregunta.imatge}" alt="Pregunta ${i + 1}"><br>`;

        pregunta.respostes.forEach((resposta, j) => {
            htmlString += `<button id="${i}_${j}" class="btn-resposta" data-preg="${i}" data-resp="${j}">${resposta.resposta}</button><br>`;
        });
        htmlString += `<hr>`;
    });

    // 2. Afegim el botó de finalitzar (amagat inicialment)
    htmlString += `<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>`;

    // 3. Inserim l'HTML al contenidor
    contenidor.innerHTML = htmlString;

    // 4. Afegim l'event listener per al botó Finalitzar
    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (btnFinalitzar) {
        btnFinalitzar.addEventListener("click", mostrarResultats);
    }

    // 5. Delegació d'esdeveniments per als botons de resposta
    contenidor.addEventListener('click', (e) => {
        const target = e.target;
        // Si el target que s'ha fet click té la classe 'btn-resposta' i l'atribut 'data-preg'
        if (target.classList.contains('btn-resposta') && target.hasAttribute('data-preg')) {
            marcarResposta(target.dataset.preg, target.dataset.resp);
        }
    });

    // 6. Restaura seleccions si existeixen (es crida de nou en carregarJoc)
    // actualitzarMarcador(); // No cal cridar-la aquí perquè ja es crida a carregarJoc
}

//-------------------------
// FUNCIÓ QUE ACTUALITZA EL MARCADOR DE RESPOSTES I LA SELECCIÓ VISUAL.
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    let textMarcador = "Preguntes:<br>";

    // 1. Generar estat de les preguntes
    estatDeLaPartida.respostesUsuari.forEach((resposta, i) => {
        const estat = resposta === undefined ? "O" : "X";
        textMarcador += `Pregunta ${i + 1} : ${estat}<br>`;
    });

    // 2. Afegim el botó de borrar partida
    textMarcador += `<div><button id="btnBorrar">Borrar Partida</button></div>`;
    marcador.innerHTML = textMarcador;

    // 3. Afegim l'event listener al botó de borrar partida
    const btnBorrar = document.getElementById("btnBorrar");
    if (btnBorrar) {
        btnBorrar.addEventListener('click', esborrarPartida);
    }

    // 4. Eliminem la classe 'seleccionada' de tots els botons
    document.querySelectorAll(".seleccionada").forEach(el => el.classList.remove("seleccionada"));

    // 5. Marquem les preguntes que ja estan seleccionades (afegim la classe 'seleccionada')
    estatDeLaPartida.respostesUsuari.forEach((resposta, i) => {
        if (resposta !== undefined) {
            const boto = document.getElementById(`${i}_${resposta}`);
            if (boto) boto.classList.add("seleccionada");
        }
    });

    // 6. Controlar visibilitat del botó Finalitzar
    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (btnFinalitzar) {
        btnFinalitzar.style.display = 
            estatDeLaPartida.contadorPreguntes === totesLesPreguntes.length ? "inline-block" : "none";
    }

    // 7. Emmagatzemem l'estat de la partida a localStorage
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
}

//-------------------------
// FUNCIO QUE ESBORRA LA PARTIDA I L'ESTAT (REINICIA EL JOC)
function esborrarPartida() {
    // 1. Esborrem la partida guardada a localStorage
    localStorage.removeItem("partida");

    // 2. Reiniciem l'estat de la partida a les variables globals
    estatDeLaPartida = {
        preguntaActual: 0,
        contadorPreguntes: 0,
        respostesUsuari: new Array(totesLesPreguntes.length).fill(undefined),
    };

    // 3. Redirigim a la pantalla de login per començar de nou
    mostrarLogin();
}

//--------------------------
// FUNCIONS QUE GESTIONEN ELS RESULTATS I L'ADMINISTRACIÓ
//--------------------------

//-------------------------
// FUNCIÓ QUE MOSTRA ELS RESULTATS FINALS
function mostrarResultats() {
    // 1. Amaguem el marcador
    const marcador = document.getElementById("marcador");
    if (marcador) {
        marcador.style.display = "none";
    }

    // 2. Enviem les respostes de l'usuari al servidor per obtenir els resultats
    fetch('../php/finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estatDeLaPartida.respostesUsuari)
    })
    .then(response => response.json())
    .then(resultat => {
        // 3. Mostrem els resultats a la pantalla al div questionari
        const contenidor = document.getElementById("questionari");
        contenidor.innerHTML = `
            <h2>Resultats</h2>
            <p>Total preguntes: ${resultat.total}</p>
            <p>Correctes: ${resultat.correctes}</p>
            <button class="btn-Reiniciar" id="btnReiniciar">Reiniciar</button>
        `;

        // 4. Afegim l'event listener al botó reiniciar
        document.getElementById("btnReiniciar").addEventListener("click", () => {
            // Un cop finalitzat, esborrem la partida guardada i tornem al login
            localStorage.removeItem('partida');
            mostrarLogin();
        });

        // 5. Amaguem el botó admin i reiniciem el missatge de benvinguda
        const btnAdmin = document.getElementById("btnAdmin");
        if (btnAdmin) btnAdmin.style.display = "none";
        document.getElementById("missatgeBenvinguda").textContent = "";
    })
}

//-------------------------
// FUNCIÓ QUE GESTIONA LA VISIBILITAT DE LES VISTES (Joc / Admin).
function amagarVistaAdmin(mostrarAdmin) {
    // 1. Referències als contenidors
    const questionari = document.getElementById("questionari");
    const marcador = document.getElementById("marcador");
    const crearPreguntaDiv = document.getElementById("crearPregunta");
    const editarPreguntaDiv = document.getElementById("editarPregunta");
    const adminDiv = document.getElementById("admin");

    // 2. Amaguem formularis d'edició/creació
    crearPreguntaDiv.style.display = "none";
    editarPreguntaDiv.style.display = "none";

    // 3. Mostrem o amaguem la vista d'administració
    if (mostrarAdmin) {
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "block";
    } else {
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "none";
    }
}

//-------------------------
// FUNCIÓ QUE CARREGA LA VISTA D'ADMINISTRACIÓ I EL LLISTAT DE PREGUNTES.
function carregarAdmin() {
    // 1. Amaguem la vista de joc i mostrem la vista d'administració
    amagarVistaAdmin(true);
    document.getElementById("missatgeBenvinguda").textContent = "Mode Administració";

    // 2. Fem fetch per obtenir el llistat de preguntes amb totes les dades
    fetch('../php/admin/llistatPreguntes.php')
        .then(res => res.json())
        .then(data => {
            totesLesPreguntes = data.preguntes; // Guardem a la variable global per poder accedir a les dades d'edició
            const llistatAdmin = document.getElementById("admin");
            let htmlString = `<button id="btnTornarEnrere" class="btn-tornar">Tornar enrere</button><br>`;
            htmlString += `<button id="btnCrearPregunta" class="btn-crear">Crear nova pregunta</button>`;
            htmlString += `<h2>Llistat complet de preguntes</h2>`;

            // 3. Renderitzem el llistat de preguntes
            data.preguntes.forEach((pregunta, i) => {
                htmlString += `<div class="pregunta-admin"><h3>${i + 1}. ${pregunta.pregunta}</h3>`;
                pregunta.respostes.forEach(resposta => {
                    htmlString += `<p>- ${resposta.resposta}</p>`;
                });
                htmlString += `<button class="btn-eliminar" data-id="${pregunta.id}">Eliminar</button>`;
                htmlString += `<button class="btn-editar" data-id="${pregunta.id}">Editar</button></div><hr>`;
            });

            llistatAdmin.innerHTML = htmlString;
        })
}

//-------------------------
// FUNCIÓ QUE RENDERITZA EL FORMULARI PER CREAR UNA NOVA PREGUNTA.
function carregarFormulariCrear() {
    // 1. Amaguem totes les vistes i mostrem el contenidor de creació
    amagarVistaAdmin(false);
    document.getElementById("admin").style.display = "none";
    const crearPreguntaDiv = document.getElementById("crearPregunta");
    crearPreguntaDiv.style.display = "block";

    // 2. Generem el formulari
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
    // 3. Afegim els event listeners
    document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
    document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
}

//-------------------------
// FUNCIÓ QUE RECULL LES DADES DEL FORMULARI I CREA UNA NOVA PREGUNTA AL SERVIDOR.
function crearPregunta() {
    const form = document.getElementById("formCrearPregunta");
    const preguntaText = form.querySelector('#preguntaText').value;
    const imatgeLink = form.querySelector('#imatgeLink').value;

    // 1. Recollim els valors dels camps de resposta
    const NOMS_RESPOSTES = ['resposta1', 'resposta2', 'resposta3', 'resposta4'];
    const respostesInputs = NOMS_RESPOSTES.map(nomCamp => form.querySelector(`input[name="${nomCamp}"]`).value);
    
    // 2. Comprovem la resposta correcta
    const radioCorrecta = form.querySelector('input[name="correcta"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca quina és la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

    // 3. Enviem la petició al servidor
    fetch('../php/admin/crearPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pregunta: preguntaText,
            respostes: respostesInputs,
            correcta: correctaIndex,
            imatge: imatgeLink
        })
    })
    .then(response => response.json())
    .then(data => {
        // 4. Mostrem missatge i recarreguem la vista d'administració
        alert(data.message);
        const crearDiv = document.getElementById("crearPregunta");
        if (crearDiv) crearDiv.style.display = "none";
        carregarAdmin();
    })
}

//-------------------------
// FUNCIÓ QUE ENVIA UNA PETICIÓ PER ELIMINAR UNA PREGUNTA.
function eliminarPregunta(idPregunta) {
    // 1. Enviem la petició d'eliminació
    fetch('../php/admin/eliminarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(idPregunta) })
    })
    .then(res => res.json())
    .then(resp => {
        // 2. Mostrem missatge i recarreguem la vista d'administració
        alert(resp.message);
        carregarAdmin();
    })
}

//-------------------------
// FUNCIÓ QUE CARREGA EL FORMULARI D'EDICIÓ D'UNA PREGUNTA AMB LES SEVES DADES ACTUALS.
function editarPregunta(idPregunta) {
    const idBuscada = Number(idPregunta);
    // 1. Busquem la pregunta a l'array global
    const pregunta = totesLesPreguntes.find(p => Number(p.id) === idBuscada);
    if (!pregunta) return;

    // 2. Amaguem totes les vistes i mostrem el contenidor d'edició
    amagarVistaAdmin(false);
    document.getElementById("admin").style.display = "none";
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";
    
    // 3. Generem el formulari
    let htmlString = `
        <button id="btnCancelarEdicio" class="btn-tornar">Cancelar</button>
        <h2>Editar Pregunta ${idPregunta}</h2>
        <form id="formEditarPregunta">
            <label>Pregunta:</label><br>
            <input type="text" id="editarTextPregunta" value="${pregunta.pregunta}"><br><br>
            <label>Imatge:</label><br>
            <input type="text" id="editarLinkImatge" value="${pregunta.imatge}"><br><br>
            <label>Respostes:</label><br>
    `;
    
    // 4. Afegim les respostes (cercant quina és la correcta a l'array de respostes)
    pregunta.respostes.forEach((resposta, i) => {
        // Busquem l'índex de la resposta correcta a la BD per marcar el radiu
        const correcta = totesLesPreguntes.find(p => Number(p.id) === idBuscada)
                                         .respostes.findIndex(r => r.correcta); 
        const checked = (correcta === i) ? "checked" : "";

        htmlString += `<input type="text" id="resposta${i}" value="${resposta.resposta}">`;
        htmlString += `<input type="radio" name="correctaEditar" value="${i}" ${checked}> Correcta<br>`;
    });

    htmlString += `<br><button type="button" id="btnGuardarCanvis">Guardar Canvis</button>`;
    htmlString += `</form>`;
    editarDiv.innerHTML = htmlString;
    
    // 5. Afegim els event listeners
    document.getElementById("btnGuardarCanvis").addEventListener("click", () => actualitzarPregunta(idPregunta));
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
}

//-------------------------
// FUNCIÓ QUE ENVIA LES DADES ACTUALITZADES D'UNA PREGUNTA AL SERVIDOR.
function actualitzarPregunta(idPregunta) {
    const form = document.getElementById("formEditarPregunta");
    const preguntaText = form.querySelector("#editarTextPregunta").value;
    const imatgeLink = form.querySelector("#editarLinkImatge").value;
    
    // 1. Recollim les respostes
    const respostes = [0, 1, 2, 3].map(i => form.querySelector(`#resposta${i}`).value);

    // 2. Comprovem la resposta correcta
    const radioCorrecta = form.querySelector('input[name="correctaEditar"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

    // 3. Enviem la petició d'actualització
    fetch('../php/admin/editarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: Number(idPregunta),
            pregunta: preguntaText,
            respostes: respostes,
            correcta: Number(correctaIndex),
            imatge: imatgeLink
        })
    })
    .then(response => response.json())
    .then(data => {
        // 4. Mostrem missatge i recarreguem la vista d'administració
        alert(data.message);
        const editarDiv = document.getElementById('editarPregunta');
        if (editarDiv) editarDiv.style.display = 'none';
        carregarAdmin();
    })
}


//--------------------------
// INICIALITZACIÓ
//--------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Creem el botó admin (amagat inicialment)
    const btnAdmin = document.createElement("button");
    btnAdmin.textContent = "Admin";
    btnAdmin.className = "btn-admin";
    btnAdmin.id = "btnAdmin";
    btnAdmin.style.display = "none";
    
    // 2. Afegim el botó admin al contenidor principal i carreguem l'event listener
    const contenidorPrincipal = document.getElementById("contenidor-principal");
    if (contenidorPrincipal) {
        contenidorPrincipal.appendChild(btnAdmin);
    }
    btnAdmin.addEventListener("click", carregarAdmin);

    // 3. Comprovem si hi ha alguna sessió guardada (nom usuari i localstorage)
    const nomGuardat = localStorage.getItem("nomUsuari");
    // --> Si hi ha sessió carreguem el joc, si no mostrem el login
    if (nomGuardat) {
        nomUsuari = nomGuardat;
        carregarJoc();
    } else {
        mostrarLogin();
    }
    
    // 4. Delegació d'events de la vista d'administració (eliminar/editar/tornar/crear)
    const llistatAdmin = document.getElementById("admin");
    if (llistatAdmin) {
        llistatAdmin.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            
            if (target.id === 'btnTornarEnrere') {
                // --> Tornar enrere: Amaguem admin i mostrem joc
                document.getElementById("admin").style.display = "none";
                document.getElementById("missatgeBenvinguda").style.display = "block";
                mostrarJoc();
            } else if (target.id === 'btnCrearPregunta') {
                // --> Crear: Carreguem formulari de creació
                carregarFormulariCrear();
            } else if (target.classList.contains('btn-eliminar') && id) {
                // --> Eliminar: Cridem a la funció d'eliminació
                eliminarPregunta(id);
            } else if (target.classList.contains('btn-editar') && id) {
                // --> Editar: Cridem a la funció d'edició
                editarPregunta(id);
            }
        });
    }
});