//-----------------------------
// VARIABLES GLOBALS!!
//-----------------------------
let estatDeLaPartida = {
    preguntaActualIndex: 0,
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
    
    //Netejem el nom introduït (tot a minuscules)
    const nomNet = nomIntroduit.toLowerCase();
    
    // Definim les paraules clau simplificades
    const ES_ADMIN = nomNet === 'admin' || nomNet === 'administrador' || nomNet === 'administradora';

    //3. comprovem si es admin o un usuari normal
    if (nomIntroduit) {
        // Cas ADMIN
        if (ES_ADMIN) {
            //si es admin posem el nom d'usuari a "Admin"
            document.getElementById("login").style.display = "none";
            carregarAdmin();
            
        // Cas Usuari Normal
        } else {
            //si es usuari normal, guardem el nom a la variable global i al localstorage
            nomUsuari = nomIntroduit;
            localStorage.setItem("nomUsuari", nomUsuari);
            
            // Amaguem el formulari del login i mostrem el joc
            document.getElementById("login").style.display = "none";
            carregarJoc();
        }
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
// Funció que actualitza el marcador (Simplificada per Navegació)
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    const totalPreguntes = totesLesPreguntes.length;
    
    //1. Mostrem el número de pregunta actual i el total de preguntes
    let textMarcador = `Pregunta: ${estatDeLaPartida.preguntaActualIndex + 1} / ${totalPreguntes}<br>`;
    
    //2. actualitzem el temps restant
    const tempsPartida = document.getElementById("temps");
    if (tempsPartida) {
        tempsPartida.textContent = formatTemps(estatDeLaPartida.tempsRestant);
    }

    //3. carreguem el botó per esborrar la partida i el seu event listener
    textMarcador += `<div><button id="btnBorrar">Borrar Partida</button></div>`;
    marcador.innerHTML = textMarcador;

    const btnBorrar = document.getElementById("btnBorrar");
    if (btnBorrar) {
        btnBorrar.addEventListener('click', esborrarPartida);
    }

    // Netejar la selecció visual (de la pregunta seleccionada) de qualsevol pregunta anterior
    document.querySelectorAll(".seleccionada").forEach(el => el.classList.remove("seleccionada"));
    
    //4. Si l'usuari ja ha seleccionat una resposta per la pregunta actual, la marquem
    const respostaActual = estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActualIndex];
    if (respostaActual !== undefined) {
         // Utilitzem l'índex de la pregunta actual per trobar l'ID del botó
         const boto = document.getElementById(`${estatDeLaPartida.preguntaActualIndex}_${respostaActual}`);
         if (boto) boto.classList.add("seleccionada");
    }

    // Emmagatzemo l'estat de la partida a localStorage
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

    //4. Guardem la resposta utilitzant l'índex de la pregunta que es veu i per ultim actualitzem el marcador
    estatDeLaPartida.respostesUsuari[preguntaIndex] = numResposta;

    actualitzarMarcador();
}

//-------------------------
//Renderitza la pregunta que toca mostrar
function renderPreguntaActual() {
    //1. Agafem el contenidor i la pregunta actual (el seu index)
    const contenidor = document.getElementById("questionari");
    const index = estatDeLaPartida.preguntaActualIndex;
    const pregunta = totesLesPreguntes[index];

    if (!pregunta) return; 
    
    let htmlString = "";
    
    //2.Mostrem les dades de la pregutna actual (imatges, i les seves respostes)
    htmlString += `<h3>Pregunta ${index + 1}: ${pregunta.pregunta}</h3><br>`;
    htmlString += `<img src="../${pregunta.imatge}" alt="Pregunta ${index + 1}"><br>`; 

    pregunta.respostes.forEach((resposta, j) => {
        const idResposta = `${index}_${resposta.id}`; 
        htmlString += `<button id="${idResposta}" class="btn-resposta" data-preg="${index}" data-resp="${resposta.id}">${resposta.resposta}</button><br>`; 
    });
    
    htmlString += `<hr>`;

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
    
    // Botó FINALITZAR (Si som a l'última pregunta)
    const btnFinalitzar = (index === totalPreguntes - 1) ? 
                          `<button id="btnFinalitzar" class="btn-finalitzar">Finalitzar</button>` : 
                          '';

    htmlString += `<div class="navegacio-buttons">${btnEnrera} ${btnSeguent} ${btnFinalitzar}</div>`;
    
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
    //click botó finalitzar
    if (document.getElementById("btnFinalitzar")) {
        document.getElementById("btnFinalitzar").addEventListener("click", mostrarResultats);
    }
    
    // 4. Afegim l'escolta d'esdeveniments per marcar la resposta
    contenidor.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn-resposta') && target.hasAttribute('data-preg')) {
            marcarResposta(target.dataset.preg, target.dataset.resp);
        }
    });
    
    // 5. Actualitzem el marcador i la selecció visual
    actualitzarMarcador(); 
}

//-------------------------
//Gestiona la navegació entre preguntes (Següent/Enrera)
function canviarPregunta(direccio) {
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
            <button class="btn-Sortir" id="btnSortir">Sortir</button>
        `;

        //4. Afegim els Event Listeners als nous botons:
        
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

        //5. Si existeix el botó admin, l'amaguem 
        const btnAdmin = document.getElementById("btnAdmin");
        if (btnAdmin) btnAdmin.style.display = "none";
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

            <div id="preview-container"></div>

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
    //afegim els event listeners als botons
    document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
    document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
    // Afegim event listener per la previsualització de la imatge (aquest crida a la funció previsualitzarImatge)
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
    //1. Declarem les variables i busquem la pregunta a editar
    const idBuscada = Number(idPregunta);
    const pregunta = totesLesPreguntes.find(p => Number(p.id) === idBuscada);
    if (!pregunta) return;
    //2. Amaguem la vista admin i mostrem el formulari d'edició
    amagarVistaAdmin(false);
    document.getElementById("admin").style.display = "none";
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";

    //3. Generem el HTML del formulari amb les dades de la pregunta
    let htmlString = `
        <button type="button" id="btnCancelarEdicio" class="btn-tornar">Cancelar</button>
        <h2>Editar Pregunta</h2>
        <form id="formEditarPregunta">
            <label>Pregunta:</label><br>
            <input type="text" id="editarTextPregunta" value="${pregunta.pregunta}"><br><br>
            
            <label>Imatge Actual:</label><br>
            <img src="../${pregunta.imatge}" id="imatgeActualPreview" alt="Imatge actual"><br> 
            
            <label for="imatgeFitxerEditar">Pujar Nova Imatge:</label><br>
            <input type="file" id="imatgeFitxerEditar" name="imatgeFitxerEditar" accept="image/*"><br><br>
            
            <div id="nova-preview-container"></div>
            
            <label>Respostes:</label><br>
    `;
    
    // 4. Lògica per omplir les respostes (tenint en compte la correcta)
    const indexCorrecta = 0; 
    
    pregunta.respostes.forEach((resposta, i) => {
        const checked = (i === indexCorrecta) ? "checked" : ""; 
        htmlString += `<input type="text" id="resposta${i}" value="${resposta.resposta}">`;
        htmlString += `<input type="radio" name="correctaEditar" value="${i}" ${checked}> Correcta<br>`;
    });

    htmlString += `<br><button type="button" id="btnGuardarCanvis">Guardar Canvis</button>`;
    htmlString += `</form>`;
    editarDiv.innerHTML = htmlString;

    // 5. Afegim els Event Listeners
    document.getElementById("btnGuardarCanvis").addEventListener("click", () => actualitzarPregunta(idPregunta));
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
    
    //6. Afegim event listener per la previsualització de la nova imatge (aquest crida a la funció previsualitzarImatge)
document.getElementById('imatgeFitxerEditar').addEventListener('change', (e) => previsualitzarImatge(e, 'imatgeActualPreview'));
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
    // 1. Comprovem si hi ha alguna sessió guardada (nom usuari i localstorage)
    const nomGuardat = localStorage.getItem("nomUsuari");
    
    // Si hi ha sessió (nom guardat), carreguem el joc
    if (nomGuardat) {
        nomUsuari = nomGuardat;
        carregarJoc();
    // Si no hi ha sessió, mostrem el login
    } else {
        mostrarLogin();
    }
    
    // 2. Generem tots els listeners de clicks per les funcions d'administrador (delegació d'esdeveniments)
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