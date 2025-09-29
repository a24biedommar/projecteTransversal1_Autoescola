// Estado global de la partida y preguntas
let estatDeLaPartida = { contadorPreguntes: 0, respostesUsuari: [] };
let totesLesPreguntes = [];

// Actualiza el marcador en pantalla
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    let text = "Preguntes Respostes:<br>";
    for (let i = 0; i < estatDeLaPartida.respostesUsuari.length; i++) {
        if (estatDeLaPartida.respostesUsuari[i] === undefined) {
            text += "Pregunta " + (i+1) + ": O<br>";
        } else {
            text += "Pregunta " + (i+1) + ": X<br>";
        }
    }
    marcador.innerHTML = text;
}
window.actualitzarMarcador = actualitzarMarcador;

// Marca la respuesta del usuario
function marcarRespuesta(numPregunta, numResposta) {
    if (estatDeLaPartida.respostesUsuari[numPregunta] === undefined) {
        estatDeLaPartida.contadorPreguntes++;
    }
    estatDeLaPartida.respostesUsuari[numPregunta] = numResposta;

    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (estatDeLaPartida.contadorPreguntes === estatDeLaPartida.respostesUsuari.length && btnFinalitzar) {
        btnFinalitzar.style.display = "inline-block";
    }

    actualitzarMarcador();
}
window.marcarRespuesta = marcarRespuesta;

// Renderiza todas las preguntas en el DOM
function renderTotesLesPreguntes(preguntes) {
    const contenidor = document.getElementById("questionari");
    contenidor.innerHTML = "";
    for (let i = 0; i < preguntes.length; i++) {
        const p = preguntes[i];
        contenidor.innerHTML += "<h3>Pregunta " + (i+1) + ": " + p.pregunta + "</h3><br>";
        contenidor.innerHTML += '<img src="' + p.imatge + '" alt="Pregunta ' + (i+1) + '"><br>';
        for (let j = 0; j < p.respostes.length; j++) {
            contenidor.innerHTML += '<button class="btn" preg="' + i + '" resp="' + j + '">' + p.respostes[j].resposta + '</button><br>';
        }
        contenidor.innerHTML += "<hr>";
    }
    contenidor.innerHTML += '<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>';

    document.getElementById("btnFinalitzar").addEventListener("click", mostrarResultats);
    contenidor.addEventListener("click", function(e) {
        if (e.target.classList.contains("btn")) {
            marcarRespuesta(Number(e.target.getAttribute("preg")), Number(e.target.getAttribute("resp")));
        }
    });
}

// Envía respuestas y muestra resultados
function mostrarResultats() {
    const marcador = document.getElementById("marcador");
    if (marcador) marcador.style.display = "none";

    fetch('../php/finalitza.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estatDeLaPartida.respostesUsuari)
    })
    .then(res => res.json())
    .then(resultat => {
        const contenidor = document.getElementById("questionari");
        contenidor.innerHTML = "<h2>Resultats</h2>" +
                                "<p>Total preguntes: " + resultat.total + "</p>" +
                                "<p>Correctes: " + resultat.correctes + "</p>" +
                                '<button class="btn-Reiniciar" id="btnReiniciar">Reiniciar</button>';
        document.getElementById("btnReiniciar").addEventListener("click", function() {
            window.location.href = 'index.html';
        });
    });
}
window.mostrarResultats = mostrarResultats;

// Admin: cargar vista principal
function carregarAdmin() {
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";
    document.getElementById("crearPregunta").style.display = "none";
    document.getElementById("editarPregunta").style.display = "none";
    const adminDiv = document.getElementById("admin");
    adminDiv.style.display = "block";

    fetch('../php/admin/llistatPreguntes.php')
    .then(res => res.json())
    .then(data => {
        totesLesPreguntes = data.preguntes;
        adminDiv.innerHTML = '<button id="btnTornarEnrere" class="btn-tornar">Tornar enrere</button><br>' +
                             '<button id="btnCrearPregunta" class="btn-crear">Crear nova pregunta</button>' +
                             '<h2>Llistat complet de preguntes</h2>';
        for (let i = 0; i < data.preguntes.length; i++) {
            const p = data.preguntes[i];
            adminDiv.innerHTML += '<div class="pregunta-admin">' +
                                  '<h3>' + (i+1) + '. ' + p.pregunta + '</h3>';
            for (let j = 0; j < p.respostes.length; j++) {
                adminDiv.innerHTML += "<p>- " + p.respostes[j].resposta + "</p>";
            }
            adminDiv.innerHTML += '<button class="btn-eliminar" data-id="' + p.id + '">Eliminar</button>' +
                                  '<button class="btn-editar" data-id="' + p.id + '">Editar</button></div><hr>';
        }

        adminDiv.addEventListener("click", function(e) {
            const target = e.target;
            if (target.id === "btnTornarEnrere") window.location.href = 'index.html';
            else if (target.id === "btnCrearPregunta") mostrarFormCrear();
            else if (target.classList.contains("btn-eliminar")) eliminarPregunta(target.dataset.id);
            else if (target.classList.contains("btn-editar")) editarPregunta(target.dataset.id);
        });
    });
}
window.carregarAdmin = carregarAdmin;

// Admin: eliminar pregunta
function eliminarPregunta(idPregunta) {
    fetch('../php/admin/eliminarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(idPregunta) })
    })
    .then(res => res.json())
    .then(resp => { alert(resp.message); carregarAdmin(); });
}
window.eliminarPregunta = eliminarPregunta;

// Admin: mostrar formulario crear pregunta
function mostrarFormCrear() {
    document.getElementById("questionari").style.display = "none";
    document.getElementById("marcador").style.display = "none";
    document.getElementById("admin").style.display = "none";

    const crearDiv = document.getElementById("crearPregunta");
    crearDiv.style.display = "block";
    crearDiv.innerHTML = '<button id="btnTornarEnrereCrear" class="btn-tornar">Enrere</button>' +
                         '<h2>Crear Nova Pregunta</h2>' +
                         '<form id="formCrearPregunta">' +
                         '<label>Pregunta:</label><br><input type="text" id="preguntaText" required><br><br>' +
                         '<label>Link Imatge:</label><br><input type="text" id="imatgeLink"><br><br>' +
                         '<input type="text" name="resposta1" required> <label>Correcta: <input type="radio" name="correcta" value="0" required></label><br>' +
                         '<input type="text" name="resposta2" required> <label>Correcta: <input type="radio" name="correcta" value="1"></label><br>' +
                         '<input type="text" name="resposta3" required> <label>Correcta: <input type="radio" name="correcta" value="2"></label><br>' +
                         '<input type="text" name="resposta4" required> <label>Correcta: <input type="radio" name="correcta" value="3"></label><br>' +
                         '<br><button type="button" id="btnGuardarPregunta">Guardar Pregunta</button></form>';

    document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
    document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
}

// Admin: crear nueva pregunta
function crearPregunta() {
    const form = document.getElementById("formCrearPregunta");
    const respostes = [];
    for (let i = 1; i <= 4; i++) respostes.push(form.querySelector('input[name="resposta'+i+'"]').value);
    const correcta = form.querySelector('input[name="correcta"]:checked').value;

    fetch('../php/admin/crearPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pregunta: form.querySelector("#preguntaText").value,
            respostes: respostes,
            correcta: correcta,
            imatge: form.querySelector("#imatgeLink").value
        })
    })
    .then(res => res.json())
    .then(data => { alert(data.message); document.getElementById("crearPregunta").style.display = "none"; carregarAdmin(); });
}
window.crearPregunta = crearPregunta;

// Admin: editar pregunta
function editarPregunta(idPregunta) {
    const pregunta = totesLesPreguntes.find(p => Number(p.id) === Number(idPregunta));
    if (!pregunta) return;

    ["questionari","marcador","admin"].forEach(id => document.getElementById(id).style.display = "none");
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";

    editarDiv.innerHTML = '<h2>Editar Pregunta</h2>' +
                          '<form id="formEditarPregunta">' +
                          '<label>Pregunta:</label><br>' +
                          '<input type="text" id="editarTextPregunta" value="'+pregunta.pregunta+'"><br><br>' +
                          '<label>Imatge:</label><br>' +
                          '<input type="text" id="editarLinkImatge" value="'+pregunta.imatge+'"><br><br>';

    for (let i = 0; i < pregunta.respostes.length; i++) {
        const r = pregunta.respostes[i];
        let checked = "";
        if (r.correcta) checked = "checked";
        editarDiv.innerHTML += '<input type="text" id="resposta'+i+'" value="'+r.resposta+'">' +
                               '<input type="radio" name="correctaEditar" value="'+i+'" '+checked+'> Correcta<br>';
    }

    editarDiv.innerHTML += '<br><button type="button" id="btnGuardarCanvis">Guardar Canvis</button>' +
                           '<button type="button" id="btnCancelarEdicio">Cancelar</button></form>';

    document.getElementById("btnGuardarCanvis").addEventListener("click", function() { actualitzarPregunta(idPregunta); });
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
}
window.editarPregunta = editarPregunta;

// Admin: actualizar pregunta
function actualitzarPregunta(idPregunta) {
    const preguntaText = document.getElementById("editarTextPregunta").value;
    const imatgeLink = document.getElementById("editarLinkImatge").value;
    const respostes = [];
    for (let i = 0; i < 4; i++) respostes.push(document.getElementById("resposta"+i).value);
    const correcta = Number(document.querySelector('input[name="correctaEditar"]:checked').value);

    fetch('../php/admin/editarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(idPregunta), pregunta: preguntaText, respostes: respostes, correcta: correcta, imatge: imatgeLink })
    })
    .then(res => res.json())
    .then(data => { alert(data.message); document.getElementById('editarPregunta').style.display='none'; carregarAdmin(); });
}
window.actualitzarPregunta = actualitzarPregunta;

// Inicialización del DOM
window.addEventListener('DOMContentLoaded', function() {
    fetch('../php/getPreguntes.php')
    .then(res => res.json())
    .then(data => {
        totesLesPreguntes = data.preguntes;
        estatDeLaPartida.respostesUsuari = [];
        for (let i = 0; i < totesLesPreguntes.length; i++) estatDeLaPartida.respostesUsuari.push(undefined);
        renderTotesLesPreguntes(totesLesPreguntes);
        actualitzarMarcador();
    });

    const btnAdmin = document.createElement("button");
    btnAdmin.textContent = "Admin";
    btnAdmin.className = "btn-admin";
    btnAdmin.id = "btnAdmin";
    document.getElementById("contenidor-principal").appendChild(btnAdmin);
    btnAdmin.addEventListener("click", carregarAdmin);
});
