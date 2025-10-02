//-----------------------------
// VARIABLES GLOBALS!!
//-----------------------------
let estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [],
    tempsRestant: 30, // Modificat a 30 segons
};
// Variable per emmagatzemar el nom de l'usuari inicialment buida
let nomUsuari = "";
// Array per emmagatzemar totes les preguntes carregades des del servidor
let totesLesPreguntes = [];
// Variable per l'interval del timer inicialment null
let idTimer = null; 

//-----------------------------
// FUNCIONS DE MOSTRAR I GESTIONAR EL JOC I EL LOGIN
//-----------------------------

//-------------------------
// FUNCIO QUE GESTIONA EL MOSTRAR EL LOGIN I EMMAGATZEMA EL NOM DE L'USUARI
function mostrarLogin() {
    //1. Amaguem totes les vistes menys la del login
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";
    document.getElementById("admin").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    
    const loginDiv = document.getElementById("login");
    
    //2. Netejem l'estat de la partida i el nom d'usuari
    localStorage.removeItem("partida");
    localStorage.removeItem("nomUsuari");
    nomUsuari = "";
    
    // Aturem el timer si estava actiu
    aturarTimer();

    //3. Generem el formulari de login
    loginDiv.innerHTML = `
        <h2>Inici de Sessió</h2>
        <form id="loginForm">
            <label for="username">Introdueix el teu nom:</label><br>
            <input type="text" id="username" name="username" required><br><br>
            <button type="submit" id="btnLogin">Entrar</button>
        </form>
    `;
    
    //4. Afegim l'event listener al formulari (botó entrar)
    const formLogin = document.getElementById("loginForm");
    if (formLogin) {
        formLogin.addEventListener("submit", gestionarLogin);
    }
    
    //5. Mostrem el div del login
    loginDiv.style.display = "block";
    document.getElementById("missatgeBenvinguda").textContent = "Qüestionari Autoescola";
    
    //6. Amaguem el botó admin
    const btnAdmin = document.getElementById("btnAdmin");
    if (btnAdmin) btnAdmin.style.display = "none";

    // Amaguem el temps a la login page
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) tempsPartida.style.display = "none";
}

//-------------------------
// FUNCIO QUE GESTIONA EL LOGIN
function gestionarLogin(event) {
    //1. Evitem que el formulari s'envii (evita el refresh de la pagina)
    event.preventDefault(); 
    
    //2. Agafem el nom introduït al formulari 
    const inputNom = document.getElementById("username");
    const nomIntroduit = inputNom.value;
    
    //3. Si s'ha introduït un nom, l'emmagatzemem al localstorage i amaguem el login
    if (nomIntroduit) {
        nomUsuari = nomIntroduit;
        localStorage.setItem("nomUsuari", nomUsuari);
        
        //4. Amaguem el formulari del login i mostrem el joc
        document.getElementById("login").style.display = "none";
        carregarJoc();
    }
}

//-------------------------
// FUNCIO QUE CARREGA EL JOC I EL MOSTRA
function mostrarJoc() {
    //1. Amaguem el login i mostrem el questionari i el marcador
    document.getElementById("login").style.display = "none";
    document.getElementById("questionari").style.display = "block";
    document.getElementById("marcador").style.display = "block";
    document.getElementById("admin").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    
    //2. Mostrem el missatge de benvinguda amb el nom de l'usuari 
    document.getElementById("missatgeBenvinguda").textContent = `Benvingut ${nomUsuari}!`;
    
    //3. Si existeix el botó admin, el mostrem
    const btnAdmin = document.getElementById("btnAdmin");
    if (btnAdmin) btnAdmin.style.display = "inline-block";

    // Mostrem l'element del temps i l'activem
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) {
        tempsPartida.style.display = "block";
        iniciarTimer();
    }
}

//-------------------------
// FUNCIO QUE CARREGA EL JOC
function carregarJoc() {
    //1. Si existeix la partida al localstorage, la carreguem
    if (localStorage.partida) {
        estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));
    } else {
        // Si no hi ha partida, inicialitzem l'estat de la partida
         estatDeLaPartida = {
            preguntaActual: 0,
            contadorPreguntes: 0,
            respostesUsuari: [],
            tempsRestant: 30,
        };
    }

    //2. Carreguem les preguntes fent un fetch al servidor
    fetch('../php/getPreguntes.php')
        .then(response => response.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
             // si es el primer cop que carreguem la partida, inicialitzem l'array de respostes amb undefined
            if (estatDeLaPartida.respostesUsuari.length !== totesLesPreguntes.length) {
                estatDeLaPartida.respostesUsuari = new Array(totesLesPreguntes.length).fill(undefined);
            }

            //3. Truquem a les funcions per renderitzar les preguntes i actualitzar el marcador i per mostrar el joc
            renderTotesLesPreguntes(totesLesPreguntes); 
            actualitzarMarcador(); 
            mostrarJoc();
        });
}

//--------------------------
// FUNCIONS QUE GESTIONEN EL LOCAL STORAGE
//--------------------------

//-------------------------
// FUNCIO QUE ESBORRA LA PARTIDA I L'ESTAT
function esborrarPartida() {
    //1. Esborrem la partida i l'estat el reiniciem a 0
    localStorage.removeItem("partida");
    estatDeLaPartida = {
        preguntaActual: 0,
        contadorPreguntes: 0,
        respostesUsuari: [],
        tempsRestant: 30,
    };

    //2. Amaguem el botó finalitzar 
    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (btnFinalitzar) {
        btnFinalitzar.style.display = "none";
    }
    
    // Aturem el timer i amaguem l'element
    aturarTimer();
    document.getElementById("temps").style.display = "none";

    //3. Redirigim a la pantalla de login
    mostrarLogin();
}

//--------------------------
// FUNCIONS QUE GESTIONEN EL TEMPORITZADOR
//--------------------------

//-------------------------
//FUNCIO QUE MODIFICA EL TEMPS PER MOSTRARLO EN FORMAT 00:SS
function formatTemps(segons) {
    //1. Retorna el temps en format 00:SS
    //*Si el temps es inferior a 10 segons, afegeix un 0 davant*
    return '00:' + (segons < 10 ? '0' + segons : segons);
}

//-------------------------
// FUNCIÓ PER INICIAR EL TEMPORITZADOR
function iniciarTimer() {
    //1. Aturem qualsevol timer que estigui actiu abans d'iniciar un de nou
    aturarTimer();

    // 2. Iniciem un nou timer que es decrementa cada segon
    idTimer = setInterval(function() {
        console.log(estatDeLaPartida.tempsRestant);
        if (estatDeLaPartida.tempsRestant > 0) {
            estatDeLaPartida.tempsRestant--;
        }

        // 3. Actualitzem el marcador
        actualitzarMarcador(); 
        
        //4. Si el temps arriba a 0, aturem el timer i mostrem els resultats
        if (estatDeLaPartida.tempsRestant <= 0) {
             aturarTimer();
             mostrarResultats(); 
        }
        
    }, 1000);
}

//-------------------------
// FUNCIÓ PER ATURAR EL TEMPORITZADOR
function aturarTimer() {
    //1.Si existeix el timer el netegem i el posem a null
    if (idTimer) {
        clearInterval(idTimer);
        idTimer = null;
    }
}

//--------------------------
// FUNCIONS QUE GESTIONEN EL QÜESTIONARI I LES PREGUNTES
//--------------------------

//-------------------------
// Funció que actualitza el marcador de respostes a la pantalla i la selecció visual.
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    const totalPreguntes = totesLesPreguntes.length;
    let textMarcador = "Preguntes:<br>";

    // Actualitzem el display del temps a l'element amb id="temps"
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) {
        tempsPartida.textContent = formatTemps(estatDeLaPartida.tempsRestant);
    }

    // Generar estat de les preguntes
    estatDeLaPartida.respostesUsuari.forEach((resposta, i) => {
        const estat = resposta === undefined ? "O" : "X";
        textMarcador += `Pregunta ${i + 1} : ${estat}<br>`;
    });

    textMarcador += `<div><button id="btnBorrar">Borrar Partida</button></div>`;
    marcador.innerHTML = textMarcador;

    const btnBorrar = document.getElementById("btnBorrar");
    if (btnBorrar) {
        btnBorrar.addEventListener('click', esborrarPartida);
    }

    // agafem tots els elements amb la classe .seleccionada i eliminem la classe .seleccionada
    document.querySelectorAll(".seleccionada").forEach(el => el.classList.remove("seleccionada"));

    // Marcar les preguntes que ja estan seleccionades
    estatDeLaPartida.respostesUsuari.forEach((resposta, i) => {
        if (resposta !== undefined) {
            const boto = document.getElementById(`${i}_${resposta}`);
            if (boto) boto.classList.add("seleccionada");
        }
    });

    // Controlar visibilitat del botó Finalitzar
    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (btnFinalitzar) {
        btnFinalitzar.style.display = 
            estatDeLaPartida.contadorPreguntes === totalPreguntes ? "inline-block" : "none";
    }

    // Emmagatzemo l'estat de la partida a localStorage
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
}

// Funció que marca la resposta de l'usuari i actualitza el comptador de preguntes.
function marcarResposta(numPregunta, numResposta) {
    // Si el temps ha acabat, ignorem les respostes
    if (estatDeLaPartida.tempsRestant <= 0) return;
    
    const preguntaIndex = parseInt(numPregunta);
    const respostaIndex = parseInt(numResposta);

    // Si la pregunta no estava contestada, incrementem el comptador
    if (estatDeLaPartida.respostesUsuari[preguntaIndex] === undefined) {
        estatDeLaPartida.contadorPreguntes++;
    }

    estatDeLaPartida.respostesUsuari[preguntaIndex] = numResposta; // Guardem el valor (índex) de la resposta

    actualitzarMarcador();
}

// Funció que crea i renderitza les preguntes del qüestionari a l'HTML.
function renderTotesLesPreguntes(preguntes) {
    const contenidor = document.getElementById("questionari");
    let htmlString = "";

    preguntes.forEach((pregunta, i) => {
        htmlString += `<h3>Pregunta ${i + 1}: ${pregunta.pregunta}</h3><br>`;
        htmlString += `<img src="../${pregunta.imatge}" alt="Pregunta ${i + 1}"><br>`; 

        pregunta.respostes.forEach((resposta, j) => {
            htmlString += `<button id="${i}_${j}" class="btn-resposta" data-preg="${i}" data-resp="${resposta.id}">${resposta.resposta}</button><br>`; // Utilitzem resposta.id com a resp
        });
        htmlString += `<hr>`;
    });

    htmlString += `<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>`;

    contenidor.innerHTML = htmlString;

    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (btnFinalitzar) {
        btnFinalitzar.addEventListener("click", mostrarResultats);
    }

    // Delegació d'esdeveniments per als botons de resposta
    contenidor.addEventListener('click', (e) => {
        const target = e.target;
        // Si el target que s'ha fet click té un botó com a clase i té un atribut de data-preg
        if (target.classList.contains('btn-resposta') && target.hasAttribute('data-preg')) {
            marcarResposta(target.dataset.preg, target.dataset.resp);
        }
    });

    // Restaura seleccions si existeixen
    actualitzarMarcador();
}

//--------------------------
// FUNCIONS QUE GESTIONEN ELS RESULTATS I L'ADMINISTRACIÓ
//--------------------------

//-------------------------
// Funció que mostra els resultats finals i permet reiniciar la partida.
function mostrarResultats() {
    // Aturem el timer
    aturarTimer();

    //1. Amaguem el marcador si existeix
    const marcador = document.getElementById("marcador");
    if (marcador) {
        marcador.style.display = "none";
    }
    
    // Amaguem l'element del temps
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) tempsPartida.style.display = "none";

    //2. Enviem les respostes de l'usuari al servidor per obtenir els resultats
    fetch('../php/finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estatDeLaPartida.respostesUsuari)
    })
    .then(response => response.json())
    .then(resultat => {

        //3. Mostrem els resultats a la pantalla al div questionari
        const contenidor = document.getElementById("questionari");
        contenidor.innerHTML = `
            <h2>Resultats</h2>
            <p>Total preguntes: ${resultat.total}</p>
            <p>Correctes: ${resultat.correctes}</p>
            <button class="btn-Reiniciar" id="btnReiniciar">Reiniciar</button>
        `;

        //4. Afegim l'event listener al botó reiniciar
        document.getElementById("btnReiniciar").addEventListener("click", () => {
            // Un cop finalitzat, esborrem la partida guardada i tornem al login
            localStorage.removeItem('partida');
            mostrarLogin();
        });

        //5. Si existeix el botó admin, l'amaguem i reiniciem el missatge de benvinguda
        const btnAdmin = document.getElementById("btnAdmin");
        if (btnAdmin) btnAdmin.style.display = "none";
        document.getElementById("missatgeBenvinguda").textContent = "";
    })
}

// Funció que gestiona la visibilitat de les vistes (Joc / Admin).
function amagarVistaAdmin(amagar) {
    // Aturem el timer quan entrem a l'administració
    aturarTimer();

    const questionari = document.getElementById("questionari");
    const marcador = document.getElementById("marcador");
    const crearPreguntaDiv = document.getElementById("crearPregunta");
    const editarPreguntaDiv = document.getElementById("editarPregunta");
    const adminDiv = document.getElementById("admin");
    const tempsPartida = document.getElementById("temps");

    if (amagar) {
        // Mostrar vista Admin
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "block";
        if (tempsPartida) tempsPartida.style.display = "none"; 
    } else {
        // Amagar totes les vistes
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "none";
        if (tempsPartida) tempsPartida.style.display = "none";
    }

    crearPreguntaDiv.style.display = "none";
    editarPreguntaDiv.style.display = "none";
}

// Funció que carrega la vista d'administració i el llistat de preguntes.
function carregarAdmin() {
    amagarVistaAdmin(true);

    document.getElementById("missatgeBenvinguda").textContent = "Mode Administració";
    
    fetch('../php/admin/llistatPreguntes.php')
        .then(res => res.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            const llistatAdmin = document.getElementById("admin");
            let htmlString = `<button id="btnTornarEnrere" class="btn-tornar">Tornar enrere</button><br>`;
            htmlString += `<button id="btnCrearPregunta" class="btn-crear">Crear nova pregunta</button>`;
            htmlString += `<h2>Llistat complet de preguntes</h2>`;

            data.preguntes.forEach((pregunta, i) => {
                htmlString += `<div class="pregunta-admin"><h3>${i + 1}. ${pregunta.pregunta}</h3>`;
                htmlString += `<img src="../${pregunta.imatge}" alt="Imatge de la pregunta"><br>`;

                pregunta.respostes.forEach(resposta => {
                    htmlString += `<p>- ${resposta.resposta}</p>`;
                });
                htmlString += `<button class="btn-eliminar" data-id="${pregunta.id}">Eliminar</button>`;
                htmlString += `<button class="btn-editar" data-id="${pregunta.id}">Editar</button></div><hr>`;
            });

            llistatAdmin.innerHTML = htmlString;
        })
}

// Funció que renderitza el formulari per crear una nova pregunta.
function carregarFormulariCrear() {
    amagarVistaAdmin(false);
    document.getElementById("admin").style.display = "none";
    const crearPreguntaDiv = document.getElementById("crearPregunta");
    crearPreguntaDiv.style.display = "block";

    crearPreguntaDiv.innerHTML = `
        <button id="btnTornarEnrereCrear" class="btn-tornar">Enrere</button>
        <h2>Crear Nova Pregunta</h2>
        <form id="formCrearPregunta">
            <label for="preguntaText">Pregunta:</label><br>
            <input type="text" id="preguntaText" name="preguntaText" required><br><br>
            <label for="imatgeFitxer">Pujar Imatge</label><br>
            <input type="file" id="imatgeFitxer" name="imatgeFitxer" accept="image/*"><br><br>
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
    document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
    document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
}

// Funció que envia una petició per eliminar una pregunta.
function eliminarPregunta(idPregunta) {
    fetch('../php/admin/eliminarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(idPregunta) })
    })
    .then(res => res.json())
    .then(resp => {
        alert(resp.message);
        carregarAdmin();
    })
}

// Funció que recull les dades del formulari i crea una nova pregunta al servidor.
function crearPregunta() {
    const form = document.getElementById("formCrearPregunta");
    
    //1. Creem un objecte FormData per enviar les dades
    const formData = new FormData();

    const preguntaText = form.querySelector('#preguntaText').value;
    
    // 2. Recolim la imatge 
    const inputImatge = form.querySelector('#imatgeFitxer');
    const fitxerImatge = inputImatge.files[0];

    // 3. Recollim les respostes i la correcta
    const respostesInputs = []; 
    for (let i = 1; i <= 4; i++) {
        const valorResposta = form.querySelector(`input[name="resposta${i}"]`).value;
        respostesInputs.push(valorResposta); //afegim la resposta a l'array
    }
    
    //4. Recollim quina és la resposta correcta
    const radioCorrecta = form.querySelector('input[name="correcta"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca quina és la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

    // 4. Afegim totes les dades al FormData
    formData.append('pregunta', preguntaText);
    formData.append('correcta', correctaIndex);
    
    // Enviarem les respostes com un string JSON
    formData.append('respostes', JSON.stringify(respostesInputs)); 
    
    //Si no hi ha fitxer d'imatges, enviem un valor buit //TO DO: no permetre enviar un valor buit
    if (fitxerImatge) {
        formData.append('imatge', fitxerImatge);
    } else {
        formData.append('imatge', '');
    }

    // 5. Enviem les dades al servidor amb fetch
    fetch('../php/admin/crearPreguntes.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        const crearDiv = document.getElementById("crearPregunta");
        if (crearDiv) crearDiv.style.display = "none";
        carregarAdmin();
    });
}

// Funció que carrega el formulari d'edició d'una pregunta amb les seves dades actuals.
function editarPregunta(idPregunta) {
    const idBuscada = Number(idPregunta);
    const pregunta = totesLesPreguntes.find(p => Number(p.id) === idBuscada);
    if (!pregunta) return;   

    amagarVistaAdmin(false);
    document.getElementById("admin").style.display = "none";
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";

    let htmlString = `
        <button type="button" id="btnCancelarEdicio" class="btn-tornar">Cancelar</button>
        <h2>Editar Pregunta</h2>
        <form id="formEditarPregunta">
            <label>Pregunta:</label><br>
            <input type="text" id="editarTextPregunta" value="${pregunta.pregunta}"><br><br>
            <label>Imatge Actual:</label><br>
            <img src="../imatges/${pregunta.imatge}" alt="Imatge actual"><br>
            <label for="imatgeFitxerEditar">Pujar Nova Imatge:</label><br>
            <input type="file" id="imatgeFitxerEditar" name="imatgeFitxerEditar" accept="image/*"><br><br>
            <label>Respostes:</label><br>
    `;
    
    const preguntaCompleta = totesLesPreguntes.find(p => Number(p.id) === idBuscada);
    // Assumim l'índex 0 com a valor inicial si no podem determinar la correcta sense un altre fetch.
    const indexCorrecta = 0; 
    
    pregunta.respostes.forEach((resposta, i) => {
        const checked = (i === indexCorrecta) ? "checked" : ""; 
        htmlString += `<input type="text" id="resposta${i}" value="${resposta.resposta}">`;
        htmlString += `<input type="radio" name="correctaEditar" value="${i}" ${checked}> Correcta<br>`;
    });

    htmlString += `<br><button type="button" id="btnGuardarCanvis">Guardar Canvis</button>`;
    htmlString += `</form>`;
    editarDiv.innerHTML = htmlString;

    document.getElementById("btnGuardarCanvis").addEventListener("click", () => actualitzarPregunta(idPregunta));
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
}

// Funció que envia les dades actualitzades d'una pregunta al servidor.
function actualitzarPregunta(idPregunta) {
    //1.Declarem les variables i recollim les dades del formulari
    const form = document.getElementById("formEditarPregunta");
    const formData = new FormData();
    const preguntaText = form.querySelector("#editarTextPregunta").value;
    
    // 2.Recollim la imatge nova si s'ha seleccionat
    const inputImatge = form.querySelector('#imatgeFitxerEditar');
    const fitxerImatge = inputImatge.files[0];
    
    // 3. Recollim les respostes i les guardem en un array (incloent la correcta)
    const respostes = []; 
    for (let i = 0; i <= 3; i++) {
        const valorResposta = form.querySelector(`#resposta${i}`).value; 
        respostes.push(valorResposta); 
    }
    // 4. Recollim quina és la resposta correcta
    const radioCorrecta = form.querySelector('input[name="correctaEditar"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

    // 5. Afegim totes les dades al FormData
    formData.append('id', Number(idPregunta));
    formData.append('pregunta', preguntaText);
    formData.append('correcta', Number(correctaIndex));
    //Enviem les respostes com un string JSON dins de l'objecte FormData
    formData.append('respostes', JSON.stringify(respostes)); 
    
    //Nomes afegim la imatge si s'ha seleccionat una nova
    if (fitxerImatge) {
        formData.append('imatge', fitxerImatge);
    } else {
        //Enviem un valor buit si no s'ha seleccionat cap imatge nova
        formData.append('imatge', '');
    }
    
    // 4. Enviament amb fetch
    fetch('../php/admin/editarPreguntes.php', {
        method: 'POST',
        body: formData // Enviem l'objecte FormData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        carregarAdmin();
        const editarDiv = document.getElementById('editarPregunta');
        if (editarDiv) editarDiv.style.display = 'none';
    })
}

//--------------------------
// CARREGUEM EL DOM I ELS LISTENERS
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
    //--> si hi ha sessió carreguem el joc
    if (nomGuardat) {
        nomUsuari = nomGuardat;
        carregarJoc();
    //--> si no hi ha sessió, mostrem el login
    } else {
        mostrarLogin();
    }
    
    // 4. Generem tots els listeners de clicks per les funcions d'administrador (editar/tornar/eliminar/crear 
    const llistatAdmin = document.getElementById("admin");
    if (llistatAdmin) {
        llistatAdmin.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            //--> tornar
            if (target.id === 'btnTornarEnrere') {
                document.getElementById("admin").style.display = "none";
                document.getElementById("missatgeBenvinguda").style.display = "block";
                mostrarJoc();
            //--> crear
            } else if (target.id === 'btnCrearPregunta') {
                carregarFormulariCrear();
            //--> eliminar
            } else if (target.classList.contains('btn-eliminar') && id) {
                eliminarPregunta(id);
            //--> editar
            } else if (target.classList.contains('btn-editar') && id) {
                editarPregunta(id);
            }
        });
    }
});