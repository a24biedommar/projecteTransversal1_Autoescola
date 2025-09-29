// Aquest objecte guarda l'estat de la partida, incloent el progrés i les respostes de l'usuari.
let estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [],
    tempsRestant: 30
};
let totesLesPreguntes = [];

function esborrarPartida() {
    localStorage.removeItem("partida");
    estatDeLaPartida = {
        preguntaActual: 0,
        contadorPreguntes: 0,
        respostesUsuari: new Array(totesLesPreguntes.length).fill(undefined),
        tempsRestant: 30
    };
    // Oculta el botón de "Finalitzar" cuando se borra la partida
    const btnFinalitzar = document.getElementById("btnFinalitzar")
    btnFinalitzar.style.display = "none";

    actualitzarMarcador();
}

// Funció que actualitza el marcador de respostes a la pantalla.
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    let textMarcador = "Preguntes:<br>";

    for (let i = 0; i < estatDeLaPartida.respostesUsuari.length; i++) {
        let estat;
        if (estatDeLaPartida.respostesUsuari[i] === undefined) {
            estat = "O";
        } else {
            estat = "X";
        }
        textMarcador += `Pregunta  ${i+1} : <span class='badge'> ${(estatDeLaPartida.respostesUsuari[i] == undefined ? "O" : "X")} </span><br>`;
    }
    textMarcador += `<div> <button id="btnBorrar">Borrar Partida</button> </div>`;
    marcador.innerHTML = textMarcador;
    const btnBorrar = document.getElementById("btnBorrar");
    if (btnBorrar) btnBorrar.addEventListener('click', esborrarPartida);

    // Elimino tots els "seleccionada" que tingui de darrere endavant per evitar errors
    let seleccio = document.getElementsByClassName("seleccionada");
    for (let k = seleccio.length - 1; k >= 0; k--) {
        seleccio[k].classList.remove("seleccionada");
    }

    // Anem a marcar les preguntes que ja estan seleccionades
    for (let i = 0; i < estatDeLaPartida.respostesUsuari.length; i++) {
        let resposta = estatDeLaPartida.respostesUsuari[i];
        if (resposta != undefined) {
            let b = document.getElementById(`${i}_${resposta}`);
            if (b) b.classList.add("seleccionada");
        }
    }

    // creem una variable btnfinalitzar la qual permet mostrar o el botó finalitzar segons les preguntes que s'han respost
    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (estatDeLaPartida.contadorPreguntes === totesLesPreguntes.length) {
        if (btnFinalitzar) {
            btnFinalitzar.style.display = "inline-block";
        }
    } else {
        if (btnFinalitzar) {
            btnFinalitzar.style.display = "none";
        }
    }

    // Emmagatzemo l'estat de la partida a localStorage
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
}

// Funció que marca la resposta de l'usuari i actualitza el comptador de preguntes.
function marcarResposta(numPregunta, numResposta) {
    if (estatDeLaPartida.respostesUsuari[numPregunta] === undefined) {
        estatDeLaPartida.contadorPreguntes++;
    }

    estatDeLaPartida.respostesUsuari[numPregunta] = numResposta;

    if (estatDeLaPartida.contadorPreguntes === totesLesPreguntes.length) {
        const btnFinalitzar = document.getElementById("btnFinalitzar");
        if (btnFinalitzar) {
            btnFinalitzar.style.display = "inline-block";
        }
    }

    actualitzarMarcador();
}

// Funció que crea i renderitza les preguntes del qüestionari a l'HTML.
function renderTotesLesPreguntes(preguntes) {
    const contenidor = document.getElementById("questionari");
    let htmlString = "";

    for (let i = 0; i < preguntes.length; i++) {
        const pregunta = preguntes[i];
        htmlString += `<h3>Pregunta ${i+1}: ${pregunta.pregunta}</h3><br>`;
        htmlString += `<img src="${pregunta.imatge}" alt="Pregunta ${i+1}"><br>`;
        for (let j = 0; j < pregunta.respostes.length; j++) {
            const resposta = pregunta.respostes[j];
            htmlString += `<button id="${i}_${j}" class="btn" data-preg="${i}" data-resp="${j}">${resposta.resposta}</button><br>`;
        }
        htmlString += `<hr>`;
    }

    htmlString += `<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>`;
    
    contenidor.innerHTML = htmlString;
    document.getElementById("btnFinalitzar").addEventListener("click", mostrarResultats);
    contenidor.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('btn')) {
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
    });
}

// Funció que gestiona la visibilitat de les vistes de joc i d'administració.
function amagarVistaAdmin(amagar) {
    let questionari = document.getElementById("questionari");
    let marcador = document.getElementById("marcador");
    let crearPreguntaDiv = document.getElementById("crearPregunta");
    let editarPreguntaDiv = document.getElementById("editarPregunta");
    let adminDiv = document.getElementById("admin");

    if (amagar) {
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "block";
    } else {
        questionari.style.display = "none";
        marcador.style.display = "none";
        adminDiv.style.display = "none";
    }

    crearPreguntaDiv.style.display = "none";
    editarPreguntaDiv.style.display = "none";
}

// Funció que carrega la vista d'administració i el llistat de preguntes des del servidor.
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

            for (let i = 0; i < data.preguntes.length; i++) {
                const pregunta = data.preguntes[i];
                htmlString += `<div class="pregunta-admin"><h3>${i + 1}. ${pregunta.pregunta}</h3>`;
                for (let j = 0; j < pregunta.respostes.length; j++) {
                    const resposta = pregunta.respostes[j];
                    htmlString += `<p>- ${resposta.resposta}</p>`;
                }
                htmlString += `<button class="btn-eliminar" data-id="${pregunta.id}">Eliminar</button>`;
                htmlString += `<button class="btn-editar" data-id="${pregunta.id}">Editar</button></div><hr>`;
            }
            llistatAdmin.innerHTML = htmlString;
            
        });
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
    });
}

// Funció que recull les dades del formulari i crea una nova pregunta al servidor.
function crearPregunta() {
    const form = document.getElementById("formCrearPregunta");
    const preguntaText = form.querySelector('#preguntaText').value;
    const imatgeLink = form.querySelector('#imatgeLink').value;
    const respostes = [ 
        form.querySelector('input[name="resposta1"]').value,
        form.querySelector('input[name="resposta2"]').value,
        form.querySelector('input[name="resposta3"]').value,
        form.querySelector('input[name="resposta4"]').value
    ];
    const correctaIndex = form.querySelector('input[name="correcta"]:checked').value;

    fetch('../php/admin/crearPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pregunta: preguntaText,
            respostes: respostes,
            correcta: correctaIndex,
            imatge: imatgeLink
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById("crearPregunta").style.display = "none";
        carregarAdmin();
    });
}

// Funció que carrega el formulari d'edició d'una pregunta amb les seves dades actuals.
function editarPregunta(idPregunta) {
    let pregunta = null;
    const idBuscada = Number(idPregunta);
    for (let i = 0; i < totesLesPreguntes.length; i++) {
        if (Number(totesLesPreguntes[i].id) === idBuscada) {
            pregunta = totesLesPreguntes[i];
            break;
        }
    }

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

    for (let i = 0; i < pregunta.respostes.length; i++) {
        const resposta = pregunta.respostes[i];
        let checked = "";
        if (resposta.correcta) {
            checked = "checked";
        }
        htmlString += `<input type="text" id="resposta${i}" value="${resposta.resposta}">`;
        htmlString += `<input type="radio" name="correctaEditar" value="${i}" ${checked}> Correcta<br>`;
    }

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

    const respostes = [];
    for (let i = 0; i < 4; i++) {
        respostes.push(form.querySelector(`#resposta${i}`).value);
    }

    const correctaIndex = form.querySelector('input[name="correctaEditar"]:checked').value;

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
        document.getElementById('editarPregunta').style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Carrego de localStorage la informació de la partida quan existeix
    if (localStorage.partida) {
        estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));
    }

    fetch('../php/getPreguntes.php')
        .then(response => response.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            if (!Array.isArray(estatDeLaPartida.respostesUsuari) || estatDeLaPartida.respostesUsuari.length !== totesLesPreguntes.length) {
                estatDeLaPartida.respostesUsuari = new Array(totesLesPreguntes.length).fill(undefined);
            }
            renderTotesLesPreguntes(totesLesPreguntes);
            actualitzarMarcador();
        });

    const btnAdmin = document.createElement("button");
    btnAdmin.textContent = "Admin";
    btnAdmin.className = "btn-admin";
    btnAdmin.id = "btnAdmin";
    document.getElementById("contenidor-principal").appendChild(btnAdmin);
    btnAdmin.addEventListener("click", carregarAdmin);

    // Afegim el listener de clics per a l'administració aquí fora de la funció `carregarAdmin`.
    const llistatAdmin = document.getElementById("admin");
    if (llistatAdmin) {
        llistatAdmin.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            if (target.id === 'btnTornarEnrere') {
                window.location.href = 'index.html';
            } else if (target.id === 'btnCrearPregunta') {
                carregarFormulariCrear();
            } else if (target.classList.contains('btn-eliminar')) {
                eliminarPregunta(id);
            } else if (target.classList.contains('btn-editar')) {
                editarPregunta(id);
            }
        });
    }
});