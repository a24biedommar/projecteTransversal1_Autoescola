//-----------------------------
// VARIABLES GLOBALS!!
//-----------------------------
let estatDeLaPartida = {
    preguntaActualIndex: 0,
    contadorPreguntes: 0,
    respostesUsuari: [],
    tempsRestant: 30, 
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
// Funció que mostra la vista de login
function mostrarLogin() {
    // 1. Amaguem totes les vistes
    document.getElementById("questionari").style.display = "none";
    document.getElementById("admin").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    
    const loginDiv = document.getElementById("login");
    
    // 2. Netejem l'estat de la partida i el nom d'usuari
    localStorage.removeItem("partida");
    localStorage.removeItem("nomUsuari");
    nomUsuari = "";
    
    aturarTimer();

    // 3. Amaguem el botó sortir i crear pregunta si existeixen
    const btnSortirGlobal = document.getElementById("btn-sortir");
    if (btnSortirGlobal) btnSortirGlobal.style.display = "none";
    
    const btnCrearPregunta = document.getElementById("btnCrearPregunta");
    if (btnCrearPregunta) btnCrearPregunta.style.display = "none";

    // 4. Generem el formulari de login
    loginDiv.innerHTML = `
        <h2>Inici de Sessió</h2>
        <form id="loginForm">
            <label for="username">Introdueix el teu nom:</label><br>
            <input type="text" id="username" name="username" required><br><br>
            <button type="submit" id="btnLogin">Entrar</button>
        </form>
    `;
    
    // 5. Afegim l'event listener al formulari (per el botó entrar)
    const formLogin = document.getElementById("loginForm");
    if (formLogin) {
        formLogin.addEventListener("submit", gestionarLogin);
    }
    
    // 6. Mostrem el div del login
    loginDiv.style.display = "block";
    document.getElementById("missatgeBenvinguda").textContent = "Qüestionari Autoescola";
    
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) tempsPartida.style.display = "none"; // Amaguem l'element del temps
}

//-------------------------
// FUNCIO QUE GESTIONA EL LOGIN
function gestionarLogin(event) {
    //1. Evitem que el formulari s'envii (evita el refresh de la pagina)
    event.preventDefault(); 
    
    //2. Agafem el nom introduït al formulari 
    const inputNom = document.getElementById("username");
    const nomIntroduit = inputNom.value;
    
    //Netejem l'input (les mayuscules) i la guardem en una variable
    const nomNet = nomIntroduit.toLowerCase(); 
    
    const ES_ADMIN = nomNet === 'admin' || nomNet === 'administrador' || nomNet === 'administradora';

    //3. Comprovem si és Admin o usuari normal
    if (nomIntroduit) {
        // Cas ADMIN
        if (ES_ADMIN) {
            document.getElementById("login").style.display = "none";
            carregarAdmin(); // Entrem directament a l'Admin
            
        // Cas Usuari Normal
        } else {
            nomUsuari = nomIntroduit;
            localStorage.setItem("nomUsuari", nomUsuari);
            
            // Amaguem el formulari del login i mostrem el joc
            document.getElementById("login").style.display = "none";
            carregarJoc();
        }
    }
}

//-------------------------
// Funció que mostra la vista de joc i amaga les altres
function mostrarJoc() {
    // 1. Amaguem el login i la vista d'admin, mostrem el questionari
    document.getElementById("questionari").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("admin").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    
    // 2. Mostrem el missatge de benvinguda i el botó de Sortir
    document.getElementById("missatgeBenvinguda").textContent = `Benvingut ${nomUsuari}!`;

    const btnSortirGlobal = document.getElementById("btn-sortir");
    if (btnSortirGlobal) btnSortirGlobal.style.display = "block";

    // 3. Mostrem l'element del temps i l'activem
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
         // Si és una partida antiga, assegurem que l'índex actual estigui definit
        if (estatDeLaPartida.preguntaActualIndex === undefined) {
             estatDeLaPartida.preguntaActualIndex = 0;
        }
    } else {
        // Si no hi ha partida, inicialitzem l'estat de la partida
         estatDeLaPartida = {
            preguntaActualIndex: 0,
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

            //3. Truquem a les funcions per renderitzar la pregunta actual i mostrar el joc
            renderPreguntaActual();
            actualitzarEstatPartida(); 
            mostrarJoc();
        });
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

        // 3. Actualitzem l'estat de la partida
        actualitzarEstatPartida(); 
        
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
// FUNCIONS QUE GESTIONEN LA PREVISUALITZACIÓ DE LA IMATGE
//--------------------------

//-------------------------
//FUNCIO QUE PREVISUALITZA LA IMATGE SELECCIONADA
function previsualitzarImatge(event, idImatgeAntiga) {
    const input = event.target;
    // Agafem el contenidor (si estem ediitant seria nova-preview-container si no sera preview-container)
    const previewContainer = document.getElementById('preview-container') || 
                             document.getElementById('nova-preview-container');
    
    // Si estem en edició, capturem la imatge antiga
    const imatgeAntiga = idImatgeAntiga ? document.getElementById(idImatgeAntiga) : null;

    previewContainer.innerHTML = ''; 
    
    // Si s'ha seleccionat un fitxer, processar
    if (input.files && input.files[0]) {
        const fitxer = input.files[0];

        // Amaguem la imatge antiga si existeix
        if (imatgeAntiga) {
            imatgeAntiga.style.display = 'none'; 
        }

        // Creem la URL i l'element <img>
        const imageUrl = URL.createObjectURL(fitxer);
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Imatge previsualitzada';
        img.className = 'imatge-previsualitzada';
        
        // Afegim la nova imatge al contenidor
        previewContainer.appendChild(img);
        
        // Netejem la memoria de la web un cop la imatge s'ha carregat
        img.onload = () => {
            URL.revokeObjectURL(imageUrl);
        };
    } else {
        // si l'usuari ha retirat la imatge, netegem el contenidor i mostrem l'antiga si existeix
        if (imatgeAntiga) {
            imatgeAntiga.style.display = 'block';
        }
    }
}


//--------------------------
// FUNCIONS QUE GESTIONEN EL QÜESTIONARI I LES PREGUNTES
//--------------------------

//-------------------------
// Funció que actualitza l'estat de la partida, el temps i la selecció visual
function actualitzarEstatPartida() {
    // 1. declarem com a variable el total de les preguntes
    const totalPreguntes = totesLesPreguntes.length;
    
    // 2. Actualitzem el temps restant
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) {
        tempsPartida.textContent = formatTemps(estatDeLaPartida.tempsRestant);
    }

    // 5. desmarquem les respostes amb la classe .seleccionada (de la anterior seleccio)
    document.querySelectorAll(".seleccionada").forEach(el => el.classList.remove("seleccionada"));
    
    // Si l'usuari ja ha contestat la pregunta actual, marquem la resposta seleccionada
    const respostaActual = estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActualIndex];
    if (respostaActual !== undefined) {
         const boto = document.getElementById(`${estatDeLaPartida.preguntaActualIndex}_${respostaActual}`);
         if (boto) boto.classList.add("seleccionada");
    }

    // 6. Guardem l'estat
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
}

//-------------------------
// Funció que marca la resposta de l'usuari i actualitza el comptador de preguntes.
function marcarResposta(numPregunta, numResposta) {
    //1. Si el temps ha arribat a 0, no permetem marcar respostes
    if (estatDeLaPartida.tempsRestant <= 0) return;
    
    //2. Convertim els valors a enters (de la pregunta i la resposta (els index))
    const preguntaIndex = parseInt(numPregunta);
    const respostaIndex = parseInt(numResposta);

    //3. Si la pregunta no estava contestada, incrementem el comptador
    if (estatDeLaPartida.respostesUsuari[preguntaIndex] === undefined) {
        estatDeLaPartida.contadorPreguntes++;
    }

    //4. Guardem la resposta utilitzant l'índex de la pregunta que es veu i per ultim actualitzem l'estat de la partida
    estatDeLaPartida.respostesUsuari[preguntaIndex] = numResposta;

    actualitzarEstatPartida();
}

//-------------------------
//Funció que renderitza la pregunta que toca mostrar
function renderPreguntaActual() {
    //1. Agafem el contenidor i la pregunta actual (el seu index)
    const contenidor = document.getElementById("questionari");
    const index = estatDeLaPartida.preguntaActualIndex;
    const pregunta = totesLesPreguntes[index];

    if (!pregunta) return; 
    
    let htmlString = "";
    
    //2. Creem l'estructura del layout amb flexbox
    htmlString += `<div class="question-content">`;
    htmlString += `<div class="question-left">`;
    htmlString += `<h3>${pregunta.pregunta}</h3>`;
    htmlString += `<img src="../${pregunta.imatge}" alt="Pregunta ${index + 1}">`;
    htmlString += `</div>`;
    
    htmlString += `<div class="question-options">`;
    pregunta.respostes.forEach((resposta, j) => {
        const idResposta = `${index}_${resposta.id}`; 
        htmlString += `<button id="${idResposta}" class="btn-resposta" data-preg="${index}" data-resp="${resposta.id}">${resposta.resposta}</button>`; 
    });
    htmlString += `</div>`;
    htmlString += `</div>`;

    // 3. Botons de Navegació
    const totalPreguntes = totesLesPreguntes.length;
    
    // Botó ENRERA (No es mostra a la Pregunta 1)
    const btnEnrera = (index > 0) ? 
                      `<button id="btnEnrera" class="btn-navegacio">Enrera</button>` : 
                      '';
    
    // Botó SEGÜENT (Si no som a l'última pregunta)
    const btnSeguent = (index < totalPreguntes - 1) ? 
                       `<button id="btnSeguent" class="btn-navegacio">Següent</button>` : 
                       '';
    
    htmlString += `<div class="navegacio-buttons">${btnEnrera} ${btnSeguent}</div>`;
    
    contenidor.innerHTML = htmlString;
    
    // 3. Afegim Event Listeners
    //click botó enrera 
    if (document.getElementById("btnEnrera")) {
        document.getElementById("btnEnrera").addEventListener("click", () => canviarPregunta(-1));
    }
    //click botó seguent
    if (document.getElementById("btnSeguent")) {
        document.getElementById("btnSeguent").addEventListener("click", () => canviarPregunta(1));
    }
    
    // 4. Afegim l'escolta d'esdeveniments per marcar la resposta
    contenidor.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-resposta') && target.hasAttribute('data-preg')) {
            marcarResposta(target.dataset.preg, target.dataset.resp);
        }
    });
    
    // 5. Actualitzem l'estat de la partida i la selecció visual
    actualitzarEstatPartida(); 
}

//-------------------------
//Gestiona la navegació entre preguntes (Següent/Enrera)
function canviarPregunta(direccio) {
    // Si l'usuari intenta anar a la seguent pregunta sense respondre la pregunta
    if (direccio > 0) {
        //mostrem un missatge de alerta
        if (estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActualIndex] === undefined) {
            alert("Has de respondre la pregunta actual abans de continuar.");
            return;
        }
    }
    const nouIndex = estatDeLaPartida.preguntaActualIndex + direccio;
    const total = totesLesPreguntes.length;
    // Comprovem que el nou índex sigui vàlid (no surti dels límits de l'array)
    if (nouIndex >= 0 && nouIndex < total) {
        // 1. Actualitzem l'índex de la pregunta que s'està mirant
        estatDeLaPartida.preguntaActualIndex = nouIndex;
        // 2. Redibuixem la pantalla per mostrar la nova pregunta
        renderPreguntaActual(); 
    }
}

//--------------------------
// FUNCIONS QUE GESTIONEN ELS RESULTATS I L'ADMINISTRACIÓ
//--------------------------

//-------------------------
// Funció que mostra els resultats finals i permet reiniciar la partida.
function mostrarResultats() {
    // Fem que el missatge de benvinguda canvii el benvingut per resultats
    document.getElementById("missatgeBenvinguda").textContent = `Resultats ${nomUsuari}!`;
    
    // Aturem el timer
    aturarTimer();
    
    // Amaguem l'element del temps
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) tempsPartida.style.display = "none";

    //Amaguem el botó sortir si existeix
    const btnSortirGlobal = document.getElementById("btn-sortir");
    if (btnSortirGlobal) btnSortirGlobal.style.display = "none";

    //1. Enviem les respostes de l'usuari al servidor per obtenir els resultats
    fetch('../php/finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estatDeLaPartida.respostesUsuari)
    })
    .then(response => response.json())
    .then(resultat => {

        //2. Mostrem els resultats a la pantalla al div questionari
        const contenidor = document.getElementById("questionari");
        contenidor.innerHTML = `
            <h2>Resultats</h2>
            <p>Total preguntes: ${resultat.total}</p>
            <p>Correctes: ${resultat.correctes}</p>
            
            <button class="btn-Reiniciar" id="btnReiniciar">Reiniciar</button>
            <button class="btn-Sortir" id="btnSortir">Sortir</button>
        `;

        //3. Afegim els Event Listeners als nous botons:
        
        // Botó reiniciar (comença una nova partida amb el mateix usuari)
        document.getElementById("btnReiniciar").addEventListener("click", () => {
            // Esborrem l'estat de la partida
            localStorage.removeItem('partida');
            // Recarreguem el joc amb el mateix nom d'usuari
            carregarJoc(); 
        });
        
        // Botó SORTIR (Tancar sessió i anar al Login)
        document.getElementById("btnSortir").addEventListener("click", () => {
            // Esborrem l'estat de la partida i la sessió d'usuari
            localStorage.removeItem('partida');
            localStorage.removeItem('nomUsuari');
            // Anem a la pantalla de login
            mostrarLogin(); 
        });

        //4. Si existeix el botó admin, l'amaguem 
        const btnAdmin = document.getElementById("btnAdmin");
        if (btnAdmin) btnAdmin.style.display = "none";
    })
}

//-------------------------
// Funció que gestiona la visibilitat de les vistes (Joc / Admin).
function amagarVistaAdmin(amagar) {
    // 1. Aturem el timer i carreguem tots els elements
    aturarTimer();
    const questionari = document.getElementById("questionari");
    const crearPreguntaDiv = document.getElementById("crearPregunta");
    const editarPreguntaDiv = document.getElementById("editarPregunta");
    const adminDiv = document.getElementById("admin");
    const tempsPartida = document.getElementById("temps");
    const btnCrearPregunta = document.getElementById("btnCrearPregunta");
    
    const btnSortirGlobal = document.getElementById("btn-sortir");

    // 2. Lògica per mostrar/amagar els contenidors segons el mode
    if (amagar) {
        // Mostrar vista Admin
        questionari.style.display = "none";
        adminDiv.style.display = "block";
        if (tempsPartida) tempsPartida.style.display = "none"; 
        if (btnSortirGlobal) btnSortirGlobal.style.display = "block";
        if (btnCrearPregunta) btnCrearPregunta.style.display = "block";
    } else {
        // Amagar totes les vistes
        questionari.style.display = "none";
        adminDiv.style.display = "none";
        if (tempsPartida) tempsPartida.style.display = "none";
        if (btnSortirGlobal) btnSortirGlobal.style.display = "block"; 
        if (btnCrearPregunta) btnCrearPregunta.style.display = "none";
    }

    crearPreguntaDiv.style.display = "none";
    editarPreguntaDiv.style.display = "none";
}

// Funció que carrega la vista d'administració i el llistat de preguntes.
function carregarAdmin() {
    amagarVistaAdmin(true);

    document.getElementById("missatgeBenvinguda").textContent = "Administració";
    
    // Mostrar botó Sortir
    const btnSortirGlobal = document.getElementById("btn-sortir");
    if (btnSortirGlobal) {
        btnSortirGlobal.style.display = "block";
        btnSortirGlobal.textContent = "Sortir";
    }
    
    // Crear i afegir botó Crear Pregunta al header
    const header = document.querySelector("header");
    let btnCrearPregunta = document.getElementById("btnCrearPregunta");
    
    if (!btnCrearPregunta) {
        btnCrearPregunta = document.createElement("button");
        btnCrearPregunta.id = "btnCrearPregunta";
        btnCrearPregunta.textContent = "Crear Pregunta";
        
        // Inserir entre missatgeBenvinguda i btn-sortir
        const missatgeBenvinguda = document.getElementById("missatgeBenvinguda");
        const btnSortir = document.getElementById("btn-sortir");
        
        header.insertBefore(btnCrearPregunta, btnSortir);
        
        // Afegir event listener
        btnCrearPregunta.addEventListener("click", carregarFormulariCrear);
    }
    
    // Mostrar el botó
    btnCrearPregunta.style.display = "block";
    
    // Amagar temps si existeix
    const tempsElement = document.getElementById("temps");
    if (tempsElement) {
        tempsElement.style.display = "none";
    }
    
    fetch('../php/admin/llistatPreguntes.php')
        .then(res => res.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            const llistatAdmin = document.getElementById("admin");
            let htmlString = "";

            data.preguntes.forEach((pregunta, i) => {
                htmlString += `<div class="admin-question">`;
                htmlString += `<h3>${i + 1}. ${pregunta.pregunta}</h3>`;
                
                htmlString += `<div class="admin-question-content">`;
                htmlString += `<div class="admin-question-left">`;
                htmlString += `<img src="../${pregunta.imatge}" alt="Imatge de la pregunta">`;
                htmlString += `</div>`;
                
                htmlString += `<div class="admin-question-options">`;
                pregunta.respostes.forEach((resposta, j) => {
                    const isCorrect = resposta.correcta === 1;
                    const className = isCorrect ? "admin-option-button correct" : "admin-option-button";
                    htmlString += `<div class="${className}">${resposta.resposta}</div>`;
                });
                htmlString += `</div>`;
                htmlString += `</div>`;
                
                htmlString += `<div class="admin-question-actions">`;
                htmlString += `<button class="admin-btn-editar" data-id="${pregunta.id}">Editar</button>`;
                htmlString += `<button class="admin-btn-eliminar" data-id="${pregunta.id}">Eliminar</button>`;
                htmlString += `</div>`;
                htmlString += `</div>`;
                
                // Afegir separador si no és l'última pregunta
                if (i < data.preguntes.length - 1) {
                    htmlString += `<hr class="admin-hr">`;
                }
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
        <div class="form-content">
            <div class="form-left">
                <div class="form-section">
                    <h3>Pregunta</h3>
                    <input type="text" class="form-input" id="preguntaText" placeholder="Introdueix la Pregunta" required>
                </div>
                <div class="form-section">
                    <h3>Imatge</h3>
                    <input type="file" class="form-input" id="imatgeFitxer" accept="image/*">
                    <div id="preview-container"></div>
                </div>
            </div>
            
            <div class="form-right">
                <div class="form-section">
                    <h3>Respostes</h3>
                    <div class="answer-container">
                        <input type="text" class="answer-input" name="resposta1" placeholder="Introdueix la resposta" required>
                        <input type="radio" class="radio-button" name="correcta" value="0" required>
                    </div>
                    <div class="answer-container">
                        <input type="text" class="answer-input" name="resposta2" placeholder="Introdueix la resposta" required>
                        <input type="radio" class="radio-button" name="correcta" value="1">
                    </div>
                    <div class="answer-container">
                        <input type="text" class="answer-input" name="resposta3" placeholder="Introdueix la resposta" required>
                        <input type="radio" class="radio-button" name="correcta" value="2">
                    </div>
                    <div class="answer-container">
                        <input type="text" class="answer-input" name="resposta4" placeholder="Introdueix la resposta" required>
                        <input type="radio" class="radio-button" name="correcta" value="3">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="form-btn-cancelar" id="btnTornarEnrereCrear">Cancelar</button>
            <button type="button" class="form-btn-guardar" id="btnGuardarPregunta">Guardar</button>
        </div>
    `;
    
    // Afegir event listeners
    document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
    document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
    document.getElementById('imatgeFitxer').addEventListener('change', (e) => previsualitzarImatge(e, null)); 
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
    //fem tots els chekers perque no es pugin enviar dades vuides als codis .php

    //validem que hi haigi una pregunta 
    const preguntaText = document.getElementById('preguntaText').value;
    if (preguntaText.trim() === '') {
        alert("Has de ficar el text per la pregunta.");
        return;
    }

    //validem que hi haigi una imatge
    const inputImatge = document.getElementById('imatgeFitxer');
    if (inputImatge.files.length === 0) {
        alert("Has de ficar la imatge per pregunta.");
        return;
    }
    const fitxerImatge = inputImatge.files[0];

    //validem que hi hagi les 4 respostes
    const respostesInputs = [];
    for (let i = 1; i <= 4; i++) {
        const respostaInput = document.querySelector(`input[name="resposta${i}"]`);
        if (respostaInput.value.trim() === '') {
            alert("Has d'omplir tots els camps de les respostes.");
            return;
        }
        respostesInputs.push(respostaInput.value);
    }
    
    //validem que s'ha marcat quina es la resposta correcta
    const radioCorrecta = document.querySelector('input[name="correcta"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca quina és la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

    // 1. Creem un objecte FormData per enviar les dades (ara que sabem que són vàlides)
    const formData = new FormData();

    // 2. Afegim totes les dades al FormData
    formData.append('pregunta', preguntaText);
    formData.append('correcta', correctaIndex);
    
    // Enviarem les respostes com un string JSON al formData
    formData.append('respostes', JSON.stringify(respostesInputs)); 
    
    // Afegim el fitxer de la imatge
    formData.append('imatge', fitxerImatge);

    // 3. Enviem les dades al servidor amb fetch
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
    //1. Declarem les variables i busquem la pregunta a editar
    const idBuscada = Number(idPregunta);
    const pregunta = totesLesPreguntes.find(p => Number(p.id) === idBuscada);
    if (!pregunta) return;
    
    //2. Amaguem la vista admin i mostrem el formulari d'edició
    amagarVistaAdmin(false);
    document.getElementById("admin").style.display = "none";
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";

    //3. Trobar l'índex de la resposta correcta
    const indexCorrecta = pregunta.respostes.findIndex(resposta => resposta.correcta === 1);

    //4. Generem el HTML del formulari amb les dades de la pregunta
    editarDiv.innerHTML = `
        <div class="form-content">
            <div class="form-left">
                <div class="form-section">
                    <h3>Pregunta</h3>
                    <input type="text" class="form-input" id="editarTextPregunta" value="${pregunta.pregunta}" required>
                </div>
                <div class="form-section">
                    <h3>Imatge</h3>
                    <img src="../${pregunta.imatge}" id="imatgeActualPreview" alt="Imatge actual" style="width: 100%; max-width: 400px; height: 200px; object-fit: cover; border-radius: 15px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); margin-bottom: 15px;">
                    <input type="file" class="form-input" id="imatgeFitxerEditar" accept="image/*">
                    <div id="nova-preview-container"></div>
                </div>
            </div>
            
            <div class="form-right">
                <div class="form-section">
                    <h3>Respostes</h3>
                    ${pregunta.respostes.map((resposta, i) => `
                        <div class="answer-container">
                            <input type="text" class="answer-input" id="resposta${i}" value="${resposta.resposta}" required>
                            <input type="radio" class="radio-button" name="correctaEditar" value="${i}" ${i === indexCorrecta ? 'checked' : ''}>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="form-actions">
            <button type="button" class="form-btn-cancelar" id="btnCancelarEdicio">Cancelar</button>
            <button type="button" class="form-btn-guardar" id="btnGuardarCanvis">Guardar</button>
        </div>
    `;

    // 5. Afegim els Event Listeners
    document.getElementById("btnGuardarCanvis").addEventListener("click", () => actualitzarPregunta(idPregunta));
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
    
    //6. Afegim event listener per la previsualització de la nova imatge
    document.getElementById('imatgeFitxerEditar').addEventListener('change', (e) => previsualitzarImatge(e, 'imatgeActualPreview'));
}

// Funció que envia les dades actualitzades d'una pregunta al servidor.
function actualitzarPregunta(idPregunta) {
    //creem els validadors abans d'enviar les dades al servidor
    //validem que el text de la pregunta no estigui buit
    const preguntaText = document.getElementById("editarTextPregunta").value;
    if (preguntaText.trim() === '') {
        alert("El text de la pregunta no pot estar buit.");
        return;
    }

    //validem que les 4 respostes no estiguin buides
    const respostes = [];
    let respostesValides = true;
    for (let i = 0; i <= 3; i++) {
        const valorResposta = document.getElementById(`resposta${i}`).value;
        if (valorResposta.trim() === '') {
            respostesValides = false;
            break;
        }
        respostes.push(valorResposta);
    }

    if (!respostesValides) {
        alert("Has d'omplir tots els camps de les respostes.");
        return;
    }

    //validem que s'ha marcat quina es la resposta correcta
    const radioCorrecta = document.querySelector('input[name="correctaEditar"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

    // 1. Creem un objecte FormData per enviar les dades (ara que sabem que són vàlides)
    const formData = new FormData();
    
    // 2. Recollim la imatge nova si s'ha seleccionat
    const inputImatge = document.getElementById('imatgeFitxerEditar');
    const fitxerImatge = inputImatge.files[0];
    
    // 3. Afegim totes les dades al FormData
    formData.append('id', Number(idPregunta));
    formData.append('pregunta', preguntaText);
    formData.append('correcta', Number(correctaIndex));
    // Enviem les respostes com un string JSON dins de l'objecte FormData
    formData.append('respostes', JSON.stringify(respostes)); 
    
    // Només afegim la imatge si s'ha seleccionat una nova
    if (fitxerImatge) {
        formData.append('imatge', fitxerImatge);
    }
    
    // 4. Enviament amb fetch
    fetch('../php/admin/editarPreguntes.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        carregarAdmin();
        const editarDiv = document.getElementById('editarPregunta');
        if (editarDiv) editarDiv.style.display = 'none';
    });
}

//-----------------------------
//CARREGUEM EL DOM I AFEGIM ELS LISTENERS
//-----------------------------
document.addEventListener('DOMContentLoaded', () => {
    
    // 1.Configurem el botó sortir global
    const btnSortirGlobal = document.getElementById("btn-sortir");
    if (btnSortirGlobal) {
        btnSortirGlobal.textContent = "Sortir"; 
        
        //si fem click al botó sortir, tanquem sessió i tornem al login
        btnSortirGlobal.addEventListener("click", () => {
            localStorage.removeItem('nomUsuari');
            localStorage.removeItem('partida');
            mostrarLogin(); 
        });
        //seguit no el mostrem 
        btnSortirGlobal.style.display = "none";
    }

    // 2. Comprovem si hi ha sessió guardada i carreguem el joc si no hi ha carreguem el login
    const nomGuardat = localStorage.getItem("nomUsuari");
    if (nomGuardat) {
        nomUsuari = nomGuardat;
        carregarJoc();
    } else {
        mostrarLogin();
    }
    
    // 3. Gestionem els clicks de la vista admin
    const llistatAdmin = document.getElementById("admin");
    if (llistatAdmin) {
        llistatAdmin.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            if (target.classList.contains('admin-btn-eliminar') && id) {
                eliminarPregunta(id);
            } else if (target.classList.contains('admin-btn-editar') && id) {
                editarPregunta(id);
            }
        });
    }
});
