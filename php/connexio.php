<?php

$servername = "localhost";
$username = "a24biedommar_Projecte0";
$password = "J7CqPQhC|Gwb%=%@";
$dbname = "a24biedommar_Projecte0";

// Creem la connexió
$conn = new mysqli($servername, $username, $password, $dbname);

//si la connexió falla, mostrem un missatge d'error senzill i aturem l'execució
if ($conn->connect_error) {
    die(" Error de connexió: " . $conn->connect_error);
}