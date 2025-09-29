// Estado global de la partida y preguntas
let estatDeLaPartida = { contadorPreguntes: 0, respostesUsuari: [] };
let totesLesPreguntes = [];

// Actualiza el marcador en pantalla
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    let text = "Preguntes Respostes:<br>";
    estatDeLaPartida.respostesUsuari.forEach((r, i) => {
        text += `Pregunta ${i + 1}: ${r === undefined ? "O" : "X"}<br>`;
    });
    marcador.innerHTML = text;
}
window.actualitzarMarcador = actualitzarMarcador;

// Marca la respuesta del usuario
function marcarRespuesta(numPregunta, numResposta) {
    if (estatDeLaPartida.respostesUsuari[numPregunta] === undefined) estatDeLaPartida.contadorPreguntes++;
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
    contenidor.innerHTML = preguntes.map((p, i) => `
        <h3>Pregunta ${i + 1}: ${p.pregunta}</h3><br>
        <img src="${p.imatge}" alt="Pregunta ${i + 1}"><br>
        ${p.respostes.map((r, j) => `<button class="btn" preg="${i}" resp="${j}">${r.resposta}</button><br>`).join("")}
        <hr>
    `).join("") + `<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>`;

    document.getElementById("btnFinalitzar").addEventListener("click", mostrarResultats);
    contenidor.addEventListener("click", e => {
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
        contenidor.innerHTML = `
            <h2>Resultats</h2>
            <p>Total preguntes: ${resultat.total}</p>
            <p>Correctes: ${resultat.correctes}</p>
            <button class="btn-Reiniciar" id="btnReiniciar">Reiniciar</button>
        `;
        document.getElementById("btnReiniciar").addEventListener("click", () => window.location.href = 'index.html');
    });
}
window.mostrarResultats = mostrarResultats;

// Admin: cargar vista principal
function carregarAdmin() {
    ["questionari", "marcador", "crearPregunta", "editarPregunta"].forEach(id => document.getElementById(id).style.display = "none");
    const adminDiv = document.getElementById("admin");
    adminDiv.style.display = "block";

    fetch('../php/admin/llistatPreguntes.php')
        .then(res => res.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            adminDiv.innerHTML = `
                <button id="btnTornarEnrere" class="btn-tornar">Tornar enrere</button><br>
                <button id="btnCrearPregunta" class="btn-crear">Crear nova pregunta</button>
                <h2>Llistat complet de preguntes</h2>
                ${data.preguntes.map((p, i) => `
                    <div class="pregunta-admin">
                        <h3>${i + 1}. ${p.pregunta}</h3>
                        ${p.respostes.map(r => `<p>- ${r.resposta}</p>`).join("")}
                        <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
                        <button class="btn-editar" data-id="${p.id}">Editar</button>
                    </div><hr>
                `).join("")}
            `;

            adminDiv.addEventListener("click", e => {
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
    ["questionari", "marcador", "admin"].forEach(id => document.getElementById(id).style.display = "none");
    const crearDiv = document.getElementById("crearPregunta");
    crearDiv.style.display = "block";
    crearDiv.innerHTML = `
        <button id="btnTornarEnrereCrear" class="btn-tornar">Enrere</button>
        <h2>Crear Nova Pregunta</h2>
        <form id="formCrearPregunta">
            <label>Pregunta:</label><br><input type="text" id="preguntaText" required><br><br>
            <label>Link Imatge:</label><br><input type="text" id="imatgeLink"><br><br>
            ${[0,1,2,3].map(i => `
                <input type="text" name="resposta${i+1}" required> 
                <label>Correcta: <input type="radio" name="correcta" value="${i}" ${i===0?'required':''}></label><br>
            `).join("")}
            <br><button type="button" id="btnGuardarPregunta">Guardar Pregunta</button>
        </form>
    `;
    document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
    document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
}

// Admin: crear nueva pregunta
function crearPregunta() {
    const form = document.getElementById("formCrearPregunta");
    const respostes = [1,2,3,4].map(i => form.querySelector(`input[name="resposta${i}"]`).value);
    const correcta = form.querySelector('input[name="correcta"]:checked').value;

    fetch('../php/admin/crearPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pregunta: form.querySelector("#preguntaText").value,
            respostes,
            correcta,
            imatge: form.querySelector("#imatgeLink").value
        })
    })
    .then(res => res.json())
    .then(data => { alert(data.message); crearDiv.style.display = "none"; carregarAdmin(); });
}
window.crearPregunta = crearPregunta;

// Admin: editar pregunta
function editarPregunta(idPregunta) {
    const pregunta = totesLesPreguntes.find(p => Number(p.id) === Number(idPregunta));
    if (!pregunta) return;

    ["questionari","marcador","admin"].forEach(id => document.getElementById(id).style.display = "none");
    const editarDiv = document.getElementById("editarPregunta");
    editarDiv.style.display = "block";

    editarDiv.innerHTML = `
        <h2>Editar Pregunta</h2>
        <form id="formEditarPregunta">
            <label>Pregunta:</label><br>
            <input type="text" id="editarTextPregunta" value="${pregunta.pregunta}"><br><br>
            <label>Imatge:</label><br>
            <input type="text" id="editarLinkImatge" value="${pregunta.imatge}"><br><br>
            ${pregunta.respostes.map((r,i) => `<input type="text" id="resposta${i}" value="${r.resposta}">
                <input type="radio" name="correctaEditar" value="${i}" ${r.correcta?"checked":""}> Correcta<br>`).join("")}
            <br><button type="button" id="btnGuardarCanvis">Guardar Canvis</button>
            <button type="button" id="btnCancelarEdicio">Cancelar</button>
        </form>
    `;
    document.getElementById("btnGuardarCanvis").addEventListener("click", () => actualitzarPregunta(idPregunta));
    document.getElementById("btnCancelarEdicio").addEventListener("click", carregarAdmin);
}
window.editarPregunta = editarPregunta;

// Admin: actualizar pregunta
function actualitzarPregunta(idPregunta) {
    const preguntaText = document.getElementById("editarTextPregunta").value;
    const imatgeLink = document.getElementById("editarLinkImatge").value;
    const respostes = Array.from({length: 4}, (_, i) => document.getElementById(`resposta${i}`).value);
    const correcta = Number(document.querySelector('input[name="correctaEditar"]:checked').value);

    fetch('../php/admin/editarPreguntes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(idPregunta), pregunta: preguntaText, respostes, correcta, imatge: imatgeLink })
    })
    .then(res => res.json())
    .then(data => { alert(data.message); document.getElementById('editarPregunta').style.display='none'; carregarAdmin(); });
}
window.actualitzarPregunta = actualitzarPregunta;

// Inicialización del DOM
window.addEventListener('DOMContentLoaded', () => {
    fetch('../php/getPreguntes.php')
        .then(res => res.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            estatDeLaPartida.respostesUsuari = new Array(totesLesPreguntes.length).fill(undefined);
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
