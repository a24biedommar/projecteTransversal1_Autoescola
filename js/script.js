// Aquest objecte guarda l'estat de la partida, incloent el progrés i les respostes de l'usuari.
let estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [],
};
let totesLesPreguntes = [];

function esborrarPartida() {
    localStorage.removeItem("partida");
    estatDeLaPartida = {
        preguntaActual: 0,
        contadorPreguntes: 0,
        respostesUsuari: new Array(totesLesPreguntes.length).fill(undefined),
    };
    
    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (btnFinalitzar) {
        btnFinalitzar.style.display = "none";
    }

    actualitzarMarcador();
}

// Funció que actualitza el marcador de respostes a la pantalla i la selecció visual.
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    let textMarcador = "Preguntes:<br>";

    // Generar estat de les preguntes
    estatDeLaPartida.respostesUsuari.forEach((resposta, i) => {
        const estat = resposta === undefined ? "O" : "X";
        textMarcador += `Pregunta ${i + 1} : ${estat}<br>`;
    });
    
    textMarcador += `<div> <button id="btnBorrar">Borrar Partida</button> </div>`;
    marcador.innerHTML = textMarcador;
    
    const btnBorrar = document.getElementById("btnBorrar");
    if (btnBorrar) {
        btnBorrar.addEventListener('click', esborrarPartida);
    }

    //agafem tots els elements amb la classe .seleccionada i eliminem la classe .seleccionada
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
            estatDeLaPartida.contadorPreguntes === totesLesPreguntes.length ? "inline-block" : "none";
    }

    // Emmagatzemo l'estat de la partida a localStorage
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
}

// Funció que marca la resposta de l'usuari i actualitza el comptador de preguntes.
function marcarResposta(numPregunta, numResposta) {
    const preguntaIndex = parseInt(numPregunta);
    const respostaIndex = parseInt(numResposta);
    
    // Si la pregunta no estava contestada, incrementem el comptador
    if (estatDeLaPartida.respostesUsuari[preguntaIndex] === undefined) {
        estatDeLaPartida.contadorPreguntes++;
    }

    estatDeLaPartida.respostesUsuari[preguntaIndex] = respostaIndex;

    actualitzarMarcador();
}

// Funció que crea i renderitza les preguntes del qüestionari a l'HTML.
function renderTotesLesPreguntes(preguntes) {
    const contenidor = document.getElementById("questionari");
    let htmlString = "";

    preguntes.forEach((pregunta, i) => {
        htmlString += `<h3>Pregunta ${i + 1}: ${pregunta.pregunta}</h3><br>`;
        htmlString += `<img src="${pregunta.imatge}" alt="Pregunta ${i + 1}"><br>`;
        
        pregunta.respostes.forEach((resposta, j) => {
            htmlString += `<button id="${i}_${j}" class="btn" data-preg="${i}" data-resp="${j}">${resposta.resposta}</button><br>`;
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
        //Si el target que s'ha fet click té un botó com a clase i té un atribut de data-preg
        if (target.classList.contains('btn') && target.hasAttribute('data-preg')) {
            marcarResposta(target.dataset.preg, target.dataset.resp);
        }
    });

    // Restaura seleccions si existeixen
    actualitzarMarcador();
}

// Funció que envia les respostes al servidor i mostra els resultats finals.
function mostrarResultats() {
    const marcador = document.getElementById("marcador");
    if (marcador) {
        marcador.style.display = "none";
    }

    fetch('../php/finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estatDeLaPartida.respostesUsuari)
    })
    .then(response => response.json())
    .then(resultat => {
        const contenidor = document.getElementById("questionari");
        contenidor.innerHTML = `
            <h2>Resultats</h2>
            <p>Total preguntes: ${resultat.total}</p>
            <p>Correctes: ${resultat.correctes}</p>
            <button class="btn-Reiniciar" id="btnReiniciar">Reiniciar</button>
        `;
        
        document.getElementById("btnReiniciar").addEventListener("click", () => {
            window.location.href = 'index.html';
        });
        
        // Un cop finalitzat, esborrem la partida guardada
        localStorage.removeItem('partida');
    })
}

// Funció que gestiona la visibilitat de les vistes (Joc / Admin).
function amagarVistaAdmin(amagar) {
    const questionari = document.getElementById("questionari");
    const marcador = document.getElementById("marcador");
    const crearPreguntaDiv = document.getElementById("crearPregunta");
    const editarPreguntaDiv = document.getElementById("editarPregunta");
    const adminDiv = document.getElementById("admin");

    if (amagar) {
        // Mostrar vista Admin
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "block";
    } else {
        // Amagar totes les vistes
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "none";
    }

    crearPreguntaDiv.style.display = "none";
    editarPreguntaDiv.style.display = "none";
}

// Funció que carrega la vista d'administració i el llistat de preguntes.
function carregarAdmin() {
    amagarVistaAdmin(true);
    
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
    const preguntaText = form.querySelector('#preguntaText').value;
    const imatgeLink = form.querySelector('#imatgeLink').value;
    
    //Fem un for per recollir els valors dels camps de resposta
    const NOMS_RESPOSTES = ['resposta1', 'resposta2', 'resposta3', 'resposta4'];
    const respostesInputs = [];
    for (let i = 0; i < NOMS_RESPOSTES.length; i++) {
        const nomCamp = NOMS_RESPOSTES[i];
        const valorResposta = form.querySelector(`input[name="${nomCamp}"]`).value;
        respostesInputs.push(valorResposta);
    }
    
    const radioCorrecta = form.querySelector('input[name="correcta"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca quina és la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

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
        alert(data.message);
        const crearDiv = document.getElementById("crearPregunta");
        if (crearDiv) crearDiv.style.display = "none";
        carregarAdmin();
    })
}

// Funció que carrega el formulari d'edició d'una pregunta amb les seves dades actuals.
function editarPregunta(idPregunta) {
    const idBuscada = Number(idPregunta);
    const pregunta = totesLesPreguntes.find(p => Number(p.id) === idBuscada);
    
    amagarVistaAdmin(false);
    document.getElementById("admin").style.display = "none";
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";

    let htmlString = `
        <h2>Editar Pregunta</h2>
        <form id="formEditarPregunta">
            <label>Pregunta:</label><br>
            <input type="text" id="editarTextPregunta" value="${pregunta.pregunta}"><br><br>
            <label>Imatge:</label><br>
            <input type="text" id="editarLinkImatge" value="${pregunta.imatge}"><br><br>
            <label>Respostes:</label><br>
    `;
    //for each per a cada resposta, si la resposta és la correcta estara checked si no estarà normal
    pregunta.respostes.forEach((resposta, i) => {
        const checked = resposta.correcta ? "checked" : "";
        htmlString += `<input type="text" id="resposta${i}" value="${resposta.resposta}">`;
        htmlString += `<input type="radio" name="correctaEditar" value="${i}" ${checked}> Correcta<br>`;
    });

    htmlString += `<br><button type="button" id="btnGuardarCanvis">Guardar Canvis</button>`;
    htmlString += `<button type="button" id="btnCancelarEdicio">Cancelar</button></form>`;
    editarDiv.innerHTML = htmlString;

    document.getElementById("btnGuardarCanvis").addEventListener("click", () => actualitzarPregunta(idPregunta));
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
}

// Funció que envia les dades actualitzades d'una pregunta al servidor.
function actualitzarPregunta(idPregunta) {
    const form = document.getElementById("formEditarPregunta");
    const preguntaText = form.querySelector("#editarTextPregunta").value;
    const imatgeLink = form.querySelector("#editarLinkImatge").value;
    //no tentenc el .map 
    const respostes = [0, 1, 2, 3].map(i => form.querySelector(`#resposta${i}`).value);

    const radioCorrecta = form.querySelector('input[name="correctaEditar"]:checked');
    if (!radioCorrecta) {
        alert("Si us plau, marca la resposta correcta.");
        return;
    }
    const correctaIndex = radioCorrecta.value;

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
        alert(data.message);
        carregarAdmin();
        const editarDiv = document.getElementById('editarPregunta');
        if (editarDiv) editarDiv.style.display = 'none';
    })
}

document.addEventListener('DOMContentLoaded', () => {
    // Carregar de localStorage la informació de la partida quan existeix
    if (localStorage.partida) {
        estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));
    }

    // Carregar les preguntes
    fetch('../php/getPreguntes.php')
        .then(response => response.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            
            // Inicialitzar o ajustar l'array de respostes
            if (!Array.isArray(estatDeLaPartida.respostesUsuari) || estatDeLaPartida.respostesUsuari.length !== totesLesPreguntes.length) {
                estatDeLaPartida.respostesUsuari = new Array(totesLesPreguntes.length).fill(undefined);
                estatDeLaPartida.contadorPreguntes = 0; // Reiniciar comptador si hi ha desajust
            }

            renderTotesLesPreguntes(totesLesPreguntes);
            actualitzarMarcador(); // Assegurar que es crida després de carregar les preguntes
        })

    // Crear i afegir el botó Admin
    const btnAdmin = document.createElement("button");
    btnAdmin.textContent = "Admin";
    btnAdmin.className = "btn-admin";
    btnAdmin.id = "btnAdmin";
    const contenidorPrincipal = document.getElementById("contenidor-principal");
    if (contenidorPrincipal) {
        contenidorPrincipal.appendChild(btnAdmin);
    }
    btnAdmin.addEventListener("click", carregarAdmin);

    // Listener de clics per a les funcions d'administració (eliminar/editar/tornar)
    const llistatAdmin = document.getElementById("admin");
    if (llistatAdmin) {
        llistatAdmin.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            
            if (target.id === 'btnTornarEnrere') {
                window.location.href = 'index.html';
            } else if (target.id === 'btnCrearPregunta') {
                carregarFormulariCrear();
            } else if (target.classList.contains('btn-eliminar') && id) {
                eliminarPregunta(id);
            } else if (target.classList.contains('btn-editar') && id) {
                editarPregunta(id);
            }
        });
    }
});