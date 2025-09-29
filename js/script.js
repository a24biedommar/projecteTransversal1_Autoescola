// Estat de la partida i preguntes globals
let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: []
};
let totesLesPreguntes = [];

// Actualitza el marcador mostrant O/X segons estat de les respostes
function actualitzarMarcador() {
    const marcador = document.getElementById("marcador");
    let text = "Preguntes Respostes:<br>";
    estatDeLaPartida.respostesUsuari.forEach((r, i) => {
        text += `Pregunta ${i + 1}: ${r === undefined ? "O" : "X"}<br>`;
    });
    marcador.innerHTML = text;
}
window.actualitzarMarcador = actualitzarMarcador;

// Marca la resposta de l'usuari
function marcarResposta(numPregunta, numResposta) {
    if (estatDeLaPartida.respostesUsuari[numPregunta] === undefined) estatDeLaPartida.contadorPreguntes++;
    estatDeLaPartida.respostesUsuari[numPregunta] = numResposta;

    const btnFinalitzar = document.getElementById("btnFinalitzar");
    if (estatDeLaPartida.contadorPreguntes === estatDeLaPartida.respostesUsuari.length && btnFinalitzar) {
        btnFinalitzar.style.display = "inline-block";
    }

    console.log(`Pregunta ${numPregunta} Resposta ${numResposta}`);
    console.log(estatDeLaPartida);
    actualitzarMarcador();
}
window.marcarRespuesta = marcarResposta;

// Renderitza totes les preguntes i afegeix els botons de resposta
function renderTotesLesPreguntes(preguntes) {
    const contenidor = document.getElementById("questionari");
    contenidor.innerHTML = preguntas.map((pregunta, i) => `
        <h3>Pregunta ${i + 1}: ${pregunta.pregunta}</h3><br>
        <img src="${pregunta.imatge}" alt="Pregunta ${i + 1}"><br>
        ${pregunta.respostes.map((r, j) => `<button class="btn" preg="${i}" resp="${j}">${r.resposta}</button><br>`).join("")}
        <hr>
    `).join("") + `<button id="btnFinalitzar" class="btn-finalitzar" style="display:none">Finalitzar</button>`;

    document.getElementById("btnFinalitzar").addEventListener("click", mostrarResultats);

    contenidor.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn")) {
            marcarResposta(Number(e.target.getAttribute("preg")), Number(e.target.getAttribute("resp")));
        }
    });
}

// Mostra resultats finals i reinicia si cal
function mostrarResultats() {
    const marcador = document.getElementById("marcador");
    if (marcador) marcador.style.display = "none";

    fetch("../php/finalitza.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        document.getElementById("btnReiniciar").addEventListener("click", () => window.location.href = "index.html");
        console.log(resultat);
    });
}
window.mostrarResultats = mostrarResultats;

// Funcions admin: carregar vista, crear, editar, eliminar preguntes
function carregarAdmin() {
    ["questionari", "marcador", "crearPregunta", "editarPregunta"].forEach(id => document.getElementById(id).style.display = "none");
    const llistatAdmin = document.getElementById("admin");
    llistatAdmin.style.display = "block";

    fetch("../php/admin/llistatPreguntes.php")
        .then(res => res.json())
        .then(data => {
            totesLesPreguntes = data.preguntes;
            llistatAdmin.innerHTML = `
                <button id="btnTornarEnrere" class="btn-tornar">Tornar enrere</button><br>
                <button id="btnCrearPregunta" class="btn-crear">Crear nova pregunta</button>
                <h2>Llistat complet de preguntes</h2>
                ${data.preguntes.map((p, idx) => `
                    <div class="pregunta-admin">
                        <h3>${idx + 1}. ${p.pregunta}</h3>
                        ${p.respostes.map(r => `<p>- ${r.resposta}</p>`).join("")}
                        <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
                        <button class="btn-editar" data-id="${p.id}">Editar</button>
                    </div><hr>
                `).join("")}
            `;

            llistatAdmin.addEventListener("click", e => {
                const target = e.target;
                if (target.id === "btnTornarEnrere") window.location.href = "index.html";
                else if (target.id === "btnCrearPregunta") carregarFormulariCrear();
                else if (target.classList.contains("btn-eliminar")) eliminarPregunta(target.dataset.id);
                else if (target.classList.contains("btn-editar")) editarPregunta(target.dataset.id);
            });

            document.getElementById("btnCrearPregunta").addEventListener("click", () => {
                ["questionari", "marcador", "admin"].forEach(id => document.getElementById(id).style.display = "none");
                const crearDiv = document.getElementById("crearPregunta");
                crearDiv.style.display = "block";
                crearDiv.innerHTML = `
                    <button id="btnTornarEnrereCrear" class="btn-tornar">Enrere</button>
                    <h2>Crear Nova Pregunta</h2>
                    <form id="formCrearPregunta">
                        <label>Pregunta:</label><br>
                        <input type="text" id="preguntaText" required><br><br>
                        <label>Link Imatge:</label><br>
                        <input type="text" id="imatgeLink"><br><br>
                        <div id="respostes-container">
                            ${[0,1,2,3].map(i => `
                                <input type="text" name="resposta${i+1}" required> 
                                <label>Correcta: <input type="radio" name="correcta" value="${i}" ${i===0?'required':''}></label><br>
                            `).join("")}
                        </div><br>
                        <button type="button" id="btnGuardarPregunta">Guardar Pregunta</button>
                    </form>
                `;
                document.getElementById("btnTornarEnrereCrear").addEventListener("click", carregarAdmin);
                document.getElementById("btnGuardarPregunta").addEventListener("click", crearPregunta);
            });
        });
}
window.carregarAdmin = carregarAdmin;

function eliminarPregunta(id) {
    fetch("../php/admin/eliminarPreguntes.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id) })
    }).then(res => res.json())
      .then(resp => { alert(resp.message); carregarAdmin(); });
}
window.eliminarPregunta = eliminarPregunta;

function crearPregunta() {
    const form = document.getElementById("formCrearPregunta");
    const respostes = [1,2,3,4].map(i => form.querySelector(`input[name="resposta${i}"]`).value);
    const correcta = form.querySelector('input[name="correcta"]:checked').value;
    fetch("../php/admin/crearPreguntes.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pregunta: form.querySelector("#preguntaText").value,
            respostes,
            correcta,
            imatge: form.querySelector("#imatgeLink").value
        })
    }).then(res => res.json()).then(data => {
        alert(data.message);
        document.getElementById("crearPregunta").style.display = "none";
        carregarAdmin();
    });
}
window.crearPregunta = crearPregunta;

// DOMContentLoaded inicialitza preguntes i marcador
window.addEventListener("DOMContentLoaded", () => {
    fetch("../php/getPreguntes.php")
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
