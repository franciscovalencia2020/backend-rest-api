# Backend Tech - API

Este proyecto es una API REST para manejar evaluaciones de empleados, usuarios, notificaciones, preguntas y respuestas.

## Configuración

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repo>
   ```

2. **Instala las dependencias**: Navega a la carpeta del proyecto y ejecuta:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**: Crea un archivo .env en la raíz del proyecto usando .env.template como referencia. Este archivo debería incluir configuraciones como el URI de la base de datos y claves secretas:
   ```bash
   PORT=3000
   MONGO_URI=my_mongo_uri
   JWT_SECRET=my_secret_key
   DB_NAME=my_db_name
   DB_TEST_NAME=my_db_name_test
   ```

4. **Compila el proyecto**: Compila el código TypeScript a JavaScript ejecutando:
   ```bash
   npm run build
   ```
5. **Ejecuta el proyecto**:
   - **Para el entorno de desarrollo**:
     ```bash
      npm run dev
     ```
   - **Para el entorno de producción** (asegúrate de haber compilado el código previamente):
     ```bash
      npm start
     ```

## Estructura del proyecto

La estructura del proyecto está organizada en diferentes directorios para facilitar la escalabilidad y el mantenimiento:

* `src/`
  * `config/:` Contiene la configuración de la base de datos y Redis.
  * `controllers/:` Incluye los controladores de las distintas rutas de la API.
  * `cron/:` Scripts cron para tareas programadas (notificaciones).
  * `docs/:` Documentación de la API en formato Swagger.
  * `middlewares/:` Middlewares para autenticación, manejo de roles y validación.
  * `models/:` Modelos de Mongoose que definen el esquema de datos en MongoDB.
  * `repositories/:` Abstracción de la capa de datos, manejo de la interacción con MongoDB.
  * `routes/:` Define las rutas de la API.
  * `services/:` Servicios que contienen la lógica de negocio, como autenticación y notificaciones.
  * `utils/:` Utilidades compartidas, como mensajes y funciones comunes.
  * `validators/:` Validaciones de los datos de entrada para cada endpoint.
* `tests/:`
  * `controllers/:` Contiene los test unitarios de los controladores de la API.
  * `integracion/:` Contine los test de integracion de los controladores de la API.

Cada carpeta se centra en una responsabilidad específica dentro de la API, lo cual facilita la mantenibilidad y escalabilidad del código. Por ejemplo, los controladores (`controllers/`) manejan las peticiones HTTP, delegando la lógica de negocio a los servicios (`services/`), y el acceso a datos a los repositorios (`repositories/`).

## Decisiones de diseño

* **Separación de capas**: Siguiendo el patrón de diseño de "Separación de capas", el proyecto está dividido en controladores, servicios, y repositorios. Esto ayuda a mantener un código modular y fácil de testear.

* **Cacheo con Redis**: Redis se utiliza para almacenar en caché las respuestas de la API y reducir la carga en la base de datos, mejorando el rendimiento.

* **Manejo de errores**: Se incluyen middlewares para el manejo de errores, garantizando que las respuestas a los usuarios tengan un formato consistente.

* **Validación de datos**: Cada endpoint utiliza validaciones definidas en validators/ para garantizar que los datos de entrada cumplan con los requisitos.


## Ejecución de Tests

* **Ejecuta los tests**: Ejecuta los tests usando el siguiente comando:
     ```bash
      npm run test
     ```

