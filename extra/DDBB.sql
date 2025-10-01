-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS examen_conduccion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE examen_conduccion;

-- Tabla de preguntas
CREATE TABLE preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta TEXT NOT NULL,
    imatge VARCHAR(500) NULL
);

-- Tabla de respuestas
CREATE TABLE respuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pregunta INT NOT NULL,
    respuesta TEXT NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id) ON DELETE CASCADE
);

-- Insertar preguntas y respuestas
INSERT INTO preguntas (pregunta, imatge) VALUES
('Quina és la velocitat màxima permesa en autopista per a turismes a Espanya?', 'https://serior-10c75.kxcdn.com/wp-content/uploads/2018/12/PR-3280.png'),
('Què indica un senyal triangular amb un dibuix d’un cérvol?', 'https://media.istockphoto.com/id/155096757/es/foto/se%C3%B1al-de-cruce-de-ciervos.jpg?s=612x612&w=0&k=20&c=6ODt0vfffrgG5jyD_19HkvWxp6JoFQPExtB9D2BW-yU='),
('Quan és obligatori utilitzar les llums d’encreuament?', 'https://img.motor.mapfre.es/wp-content/uploads/2018/05/cuando_usar_las_luces_de_posicion_las_de_cruce_y_las_largas.jpg'),
('Què s’ha de fer davant un semàfor amb llum groga fixa?', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Semaforo.png/250px-Semaforo.png'),
('Quina documentació és obligatòria portar sempre quan es condueix?', 'https://www.rodi.es/blog/wp-content/uploads/2024/08/documentos-obligatorios-permiso-conduccion-1024x650.jpg'),
('Què significa una línia contínua al centre de la calçada?', 'https://www.industriassaludes.es/wp-content/uploads/2021/05/lineas-continuas.jpg'),
('Què significa aquest senyal: un semàfor vermell encès?', 'https://clickpetroleoegas.com.br/wp-content/uploads/2025/05/ChatGPT-Image-11-de-mai.-de-2025-22_11_17.jpg'),
('Què indica una zebra pintada al carrer?', 'https://elmercantil.com/wp-content/uploads/2019/12/priroda-zebra-doroga-e1577793798393.jpg'),
('Què significa quan veus un senyal de stop (STOP)?', 'https://media.istockphoto.com/id/1204438215/es/vector/detener-dise%C3%B1o-plano-de-la-se%C3%B1al.jpg?s=612x612&w=0&k=20&c=VtPdjVDI0IH-46lIrGAtTYFdmOFadAdO39AO3owhLr0='),
('Quan està permès que un vianant creui en un pas de zebra?', 'https://media.istockphoto.com/id/2096265256/es/foto/un-padre-cuidadoso-est%C3%A1-tomado-de-la-mano-con-su-hijo-y-mira-a-su-alrededor-mientras-cruza-una.jpg?s=612x612&w=0&k=20&c=L-gm2yfrm3axX29eyZ6OVKujaR7Z_m7xUsVk7izMhiQ='),
('Què representa un senyal triangular amb vianants dibuixats?', 'https://www.shutterstock.com/image-photo/german-traffic-sign-attention-pedestrians-260nw-2306019103.jpg'),
('Què s’ha de fer quan un vehicle d''emergència amb sirenes i llums encès s''aproxima?', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsHFSAl0X64hTcJLdJXbhAXajGOe93F35X8w&s'),
('Quan es considera que un vehicle està estacionat il·legalment?', 'https://pbs.twimg.com/media/FYXjcDlX0AA_6AG.jpg');

-- Insertar respuestas
INSERT INTO respuestas (id_pregunta, respuesta, es_correcta) VALUES
(1, '120 km/h', 1),
(1, '100 km/h', 0),
(1, '130 km/h', 0),
(1, '110 km/h', 0),

(2, 'Perill per pas freqüent d’animals salvatges', 1),
(2, 'Zona de caça', 0),
(2, 'Pas de bestiar domèstic', 0),
(2, 'Reserva natural', 0),

(3, 'De nit i en túnels', 1),
(3, 'Només a l’hivern', 0),
(3, 'Només quan plou', 0),
(3, 'Quan la carretera és estreta', 0),

(4, 'Aturar-se si és possible fer-ho amb seguretat', 1),
(4, 'Passar ràpidament', 0),
(4, 'Esperar que es posi verd', 0),
(4, 'Aturar-se sempre sense excepció', 0),

(5, 'Permís de conduir, permís de circulació i assegurança', 1),
(5, 'Només el DNI', 0),
(5, 'Només el permís de conduir', 0),
(5, 'Permís de conduir i targeta ITV', 0),

(6, 'Prohibit avançar i canviar de carril', 1),
(6, 'Només recomanació de precaució', 0),
(6, 'Es pot avançar amb prudència', 0),
(6, 'Prohibit estacionar', 0),

(7, 'Parar-se totalment abans de la línia d’aturada', 1),
(7, 'Continuar si no venen cotxes', 0),
(7, 'Passar amb precaució', 0),
(7, 'Fer marxa enrere', 0),

(8, 'Pas de vianants', 1),
(8, 'Carril bus', 0),
(8, 'Zona de càrrega i descàrrega', 0),
(8, 'Estacionament perillós', 0),

(9, 'Aturar-se completament abans de continuar', 1),
(9, 'Reduir la velocitat i continuar', 0),
(9, 'Parar només si hi ha trànsit', 0),
(9, 'Fer un gir si no hi ha vehicles', 0),

(10, 'Quan el vehicle està prou lluny perquè pugui aturar-se amb seguretat', 1),
(10, 'Sempre, passi el que passi', 0),
(10, 'Només quan el semàfor de vianants estigui verd', 0),
(10, 'Només si el conductor li fa senyals', 0),

(11, 'Perill: pas de vianants pròxim', 1),
(11, 'Zona escolar', 0),
(11, 'Prohibit caminar', 0),
(11, 'Avís de carretera estreta', 0),

(12, 'Cedir-li el pas i, si cal, aturar-se fora de la via', 1),
(12, 'Continuar el trajecte', 0),
(12, 'Accelerar i evitar-lo', 0),
(12, 'Encendre les llums llargues', 0),

(13, 'Quan obstaculitza el trànsit o un pas de vianants', 1),
(13, 'Quan està sobre vorera', 0),
(13, 'Quan està a menys de 5 metres d’una cantonada', 0),
(13, 'Quan està aparcat enfront d’una porta privada', 0);
