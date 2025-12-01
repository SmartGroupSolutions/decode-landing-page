# decode-landing-page
SOFTWARE CONFIGURATION MANAGEMENT (SCM)

Este documento establece las decisiones, convenciones y procedimientos que el equipo aplicará para mantener la consistencia, trazabilidad y calidad del proyecto durante todo su ciclo de vida.

---

5.1.1 SOFTWARE DEVELOPMENT ENVIRONMENT CONFIGURATION

El equipo utiliza las siguientes herramientas para colaborar y desarrollar el proyecto digital, asegurando consistencia entre los entornos de trabajo de todos los miembros:

Herramientas Principales
- IDE: WebStorm (para desarrollo en HTML, CSS y JavaScript).
- Control de versiones: Git (CLI) y GitHub (repositorio remoto).
- Navegador de pruebas: Google Chrome.
- Diseño UX/UI: Figma.
- Gestión de proyecto: Trello o GitHub Projects.
- Documentación: Google Docs o Markdown (README.md).

Entorno Base del Proyecto
- Estructura de carpetas:
  /public
      /assets
          /styles
          /images
          /scripts
- Archivos principales:
  - README.md
  - public/index.html
  - public/assets/styles/styles.css
  - public/assets/scripts/main.js
  - public/favicon.ico

Todos los integrantes deben trabajar con la misma versión de las herramientas mencionadas y sincronizar sus entornos con la rama develop antes de iniciar una nueva tarea.

---

5.1.2 SOURCE CODE MANAGEMENT

Plataforma: GitHub
El proyecto está alojado en una organización del equipo dentro de GitHub, con repositorios separados para:
- Landing Page (código fuente)
- Acceptance Tests (archivos .feature)

Modelo de Ramas (GitFlow)
El equipo implementa el flujo de trabajo GitFlow con las siguientes ramas:

Tipo de Rama | Convención de Nombre | Propósito                         | Se crea desde | Se fusiona a
Main 	     | main                 | Código estable, versión publicada | Rama inicial  | Solo recibe fusiones
Develop      | develop              | Rama de integración y desarrollo  | main          | Solo recibe fusiones
Feature      | feature/<nombre>     | Nuevas funcionalidades            | develop       | develop
Release      | release/v<versión>   | Preparar lanzamiento              | develop       | main y develop
Hotfix       | hotfix/<nombre>      | Corrección urgente en producción  | main          | main y develop

Convenciones de Nomenclatura
- Feature: feature/HU-XX-nombre-funcionalidad
- Release: release/v1.0.0
- Hotfix: hotfix/fix-nombre-bug

Versionado Semántico (Semantic Versioning 2.0.0)
- MAJOR: Cambios incompatibles o estructurales.
- MINOR: Nuevas funciones compatibles.
- PATCH: Correcciones menores o bugs.

Conventional Commits
El formato de los mensajes de commit debe seguir las convenciones:
- feat: Nueva funcionalidad.
- fix: Corrección de errores.
- docs: Cambios en documentación.
- style: Cambios visuales o de formato.
- refactor: Reestructuración sin alterar la funcionalidad.
- test: Añadir o modificar pruebas.
- chore: Tareas de mantenimiento.

Ejemplo:
feat(header): add HTML structure for navigation bar (HU-05)
style(header): apply basic dark theme (HU-05)

---

5.1.3 SOURCE CODE STYLE GUIDE & CODING CONVENTIONS

Lenguaje y Nomenclatura
- Todo el código debe escribirse en inglés.
- Nombres en formato kebab-case (archivos y carpetas).
- Variables y funciones en camelCase.
- Clases CSS siguiendo BEM (Block–Element–Modifier).

Convenciones HTML/CSS (Google Style Guide)
- Uso semántico de etiquetas HTML.
- Sangría de dos espacios.
- Un archivo CSS principal styles.css.
- Clases descriptivas y consistentes.

Convenciones JavaScript
- Usar const y let (no var).
- Comentarios breves y descriptivos.
- Código modularizado dentro de public/assets/scripts/main.js.

Convenciones Gherkin (.feature)
- Idioma inglés.
- Estructura: Feature, Scenario, Given, When, Then.

Ejemplo:
Feature: User Registration
  Scenario: Successful registration
    Given the user is on the registration page
    When the user fills in all required fields
    Then the system displays a confirmation message

---

5.1.4 SOFTWARE DEPLOYMENT CONFIGURATION

Plataforma de Despliegue: GitHub Pages

Pasos para Publicación:
1. Asegurarse de que todas las funcionalidades estén integradas y probadas en develop.
2. Crear una rama de release:
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.0.0
3. Fusionar la rama release con main:
   git checkout main
   git pull origin main
   git merge release/v1.0.0
   git push origin main
   git tag -a v1.0.0 -m "First release v1.0.0"
   git push origin v1.0.0
4. Sincronizar develop con main:
   git checkout develop
   git merge release/v1.0.0
   git push origin develop
5. Configurar GitHub Pages en el repositorio:
   - Source: main
   - Carpeta raíz (/root)
   - Guardar cambios.

El sitio estará disponible en la URL pública proporcionada por GitHub Pages.

---

DEVELOPER WORKFLOW (FLUJO DE TRABAJO DEL DESARROLLADOR)

1. Actualizar el entorno
Antes de empezar cualquier tarea:
git checkout develop
git pull origin develop

2. Crear la rama feature
Crea una nueva rama a partir de develop siguiendo la convención:
git checkout -b feature/HU-05-header-navbar

3. Desarrollar la funcionalidad
Edita los archivos correspondientes dentro de public/ (aplicando las Style Guides y convenciones de nomenclatura).

4. Hacer commits frecuentes
Guarda tus avances con mensajes claros siguiendo Conventional Commits:
git add .
git commit -m "feat(header): add basic HTML structure for navbar (HU-05)"
git commit -m "style(header): apply dark theme to navbar (HU-05)"

5. Subir la rama al repositorio remoto
git push -u origin feature/HU-05-header-navbar

6. Crear el Pull Request (PR)
En GitHub:
Base branch: develop
Compare branch: feature/HU-05-header-navbar
Asigna un revisor (tu compañero/a).

7. Revisión y fusión
Tu compañero revisa el código (Peer Review).
Si aprueba, fusiona la rama con develop.
(Recomendado: Squash and Merge para limpiar el historial).

8. Sincronizar los cambios
Una vez fusionado:
git checkout develop
git pull origin develop
Esto actualiza tu entorno con los últimos cambios del equipo.

9. Eliminar la rama de feature
Limpia tu entorno local y remoto:
git branch -d feature/HU-05-header-navbar
git push origin :feature/HU-05-header-navbar

Resultado:
La funcionalidad quedó integrada en develop, lista para incluirse en el próximo release.

