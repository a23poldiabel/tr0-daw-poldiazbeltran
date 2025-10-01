# Test de Conducció 🚗

Aplicació web per practicar preguntes d'examen de conducció, amb administració de preguntes i respostes.

## Característiques

- Test interactiu amb temporitzador i marcador.
- Preguntes i respostes gestionades des d'una base de dades MySQL.
- Administració CRUD de preguntes i respostes (afegir, editar, eliminar).
- Imatges associades a cada pregunta.
- Gestió de sessió d'usuari amb nom i localStorage.
- Resultats mostrats al final del test.

## Estructura del projecte

- `index.html`: Interfície principal del test.
- `script.js`: Lògica del test i gestió d'estat.
- `admin.html` / `admin.js`: Interfície SPA per administrar preguntes.
- `api_preguntas.php`: API REST per CRUD de preguntes/respostes.
- `llistaPreguntes.php`: Administració tradicional amb formularis PHP.
- `getPreguntes.php`: API per obtenir preguntes aleatòries per al test.
- `finalitza.php`: Calcula resultats del test.
- `DDBB.sql`: Script per crear i poblar la base de dades.
- `.env`: Variables d'entorn amb credencials de la base de dades.

## Instal·lació

1. Clona el repositori.
2. Importa `DDBB.sql` a MySQL.
3. Crea un fitxer `.env` amb les credencials:
	```env
	DB_HOST=localhost
	DB_USER=usuari
	DB_PASS=contrasenya
	DB_NAME=nom_base_dades
	```
4. Assegura't que la carpeta `fotos/` existeix i té permisos d'escriptura.
5. Inicia el docker
6. Accedeix a `index.html` per fer el test o a `admin.html` per administrar preguntes.

## Ús

- L'usuari introdueix el seu nom i comença el test.
- Respon les preguntes mostrades una a una.
- Al final, pot veure el nombre d'encerts.
- L'administrador pot afegir, editar o eliminar preguntes i respostes des de la interfície d'administració.

## Requisits

- PHP >= 7.0
- MySQL
- Navegador modern

## Autor

Pol Diaz Beltran
