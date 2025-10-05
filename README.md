# Projecte Transversal - Test d'Autoescola

Aquest repositori pertany a una aplicació web de tests d'autoescola, dissenyada per ajudar futurs conductors a preparar-se per a l'examen teòric. L'objectiu d'aquesta app és oferir una eina d'estudi moderna i eficaç que permeti als usuaris practicar i posar a prova els seus coneixements sobre les normes de trànsit.

### Objectiu de l'Aplicació

L'objectiu principal del projecte és crear una plataforma d'aprenentatge accessible. L'aplicació funciona amb un temps limitat, de manera que els usuaris poden simular les condicions d'un examen real i rebre els resultats immediatament en acabar el temps.

A més, l'aplicació incorpora un panell d'administració que permet gestionar fàcilment les preguntes del qüestionari (implementant el CRUD).

### Estructura del Repositori

El projecte està organitzat en directoris clars per separar les diferents parts de l’aplicació. A continuació, es detalla cadascun d’aquests:

#### `html/`
Aquest directori conté els fitxers que estructuren i donen estil a la interfície d'usuari.
* **`index.html`**: És el punt d'entrada de l'aplicació web. Conté l'estructura bàsica de la pàgina i els contenidors que omple el fitxer `script.js`.
* **`estils.css`**: Conté tots els estils de l’aplicació.
* **`normalize.css`**: És un full d'estils que s'utilitza per garantir que la pàgina es vegi de manera similar a tots els navegadors.

#### `js/`
Aquí es troba el codi JavaScript que controla tota la interactivitat i la lògica del costat del client.
* **`script.js`**: Aquest és el fitxer principal del front-end. Gestiona l'estat del joc (inici de sessió, temporitzador, navegació entre preguntes), captura les respostes de l’usuari i les comunica amb el servidor (PHP).
* **`data.json`**: Un fitxer JSON amb una estructura de dades de mostra per a les preguntes. Va ser utilitzat durant les fases inicials de desenvolupament, tal com se'ns va indicar.

#### `php/`
Aquest directori conté tot el codi del servidor, escrit en PHP, que s’encarrega de gestionar les dades i la lògica de l’app.
* **`connexio.php`**: És el fitxer que estableix la connexió amb la base de dades i conté les credencials.
* **`getPreguntes.php`**: Realitza una consulta a la base de dades per obtenir totes les preguntes del test, les barreja i les retorna en format JSON al front-end (`script.js`).
* **`finalitza.php`**: Rep les respostes de l’usuari i les compara amb les correctes per calcular i mostrar la puntuació final.

#### `php/admin/`
Aquest subdirectori conté els fitxers per a les funcionalitats del panell d’administració, implementant un sistema CRUD per a les preguntes.
* **`llistatPreguntes.php`**: Obté totes les preguntes, respostes i imatges de la base de dades i les mostra en format de llista.
* **`crearPreguntes.php`**: Processa les dades enviades des del formulari de creació i fa un `INSERT` a la base de dades amb la informació introduïda per l'administrador.
* **`editarPreguntes.php`**: Actualitza una pregunta existent amb les noves dades rebudes des del formulari d'edició.
* **`eliminarPreguntes.php`**: Elimina una pregunta i les seves respostes associades de la base de dades.

## Alineació amb els Objectius de Desenvolupament Sostenible (ODS)

L’aplicació d’aquest projecte s’alinea amb l’**ODS 4: Educació de Qualitat**.

Aquesta aplicació contribueix a aquest objectiu, ja que proporciona un recurs educatiu digital i de fàcil accés per a qualsevol persona que vulgui preparar-se per obtenir el permís de conduir. En facilitar l’aprenentatge de les normes de circulació, ajudem els usuaris a superar un examen i també fomentem una conducció més segura i responsable.

## Documentació DigiSos
Per finalitzar, enllaço per aqui el link d’accés al fitxer que conté tota la documentació demanada per l’assignatura DigiSos:

- https://docs.google.com/document/d/1ZGLu2Rj9SBQIZY8U-fL_egjqRQ3o4rylJ1J1yplqnjU/edit?usp=sharing
