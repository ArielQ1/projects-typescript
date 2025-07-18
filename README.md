# projects-typescript

Este repositorio contiene varios proyectos desarrollados con TypeScript, Node.js y React, organizados en carpetas principales:


## Estructura del proyecto

- **01-project/**  
  Carpeta de prueba inicial para experimentar con la estructura de un backend en Node.js + Express + TypeScript.  
  - `backend/`: Implementa una API REST básica con autenticación, gestión de roles y usuarios, conexión a MySQL y middlewares de seguridad. Incluye utilidades para logging y monitorización, pero su propósito principal es servir como prototipo y referencia para el desarrollo posterior.
  - Scripts para desarrollo (`dev`), producción (`start`), y linting (`lint`).
  - Configuración de base de datos en archivos `.env`.

- **02-admin-users/**  
  Carpeta principal del proyecto, donde se desarrolla la solución completa de administración de usuarios.
  - `backend/`: API REST robusta en Node.js + Express + TypeScript, con estructura modular, controladores separados para roles y usuarios, middlewares personalizados (CORS, cookies), y conexión a MySQL. Incluye validaciones, tipado estricto y scripts para desarrollo, build y producción.
  - `frontend/`: Aplicación web moderna en React + TypeScript + Vite.  
    - Componentes reutilizables para la gestión de usuarios (listado, edición, registro).
    - Páginas dedicadas para edición y registro de usuarios.
    - Integración con TailwindCSS para estilos y React Router para navegación.
    - Configuración de ESLint y scripts para desarrollo (`dev`), build (`build`) y preview (`preview`).

- **docker-compose.yml**  
  Archivo de configuración para levantar servicios de MySQL y phpMyAdmin en contenedores Docker, facilitando el desarrollo y pruebas locales con base de datos persistente.

## Tecnologías principales

- Node.js, Express, TypeScript
- React, Vite, TailwindCSS
- ESLint, pnpm
- Docker, MySQL

## Uso rápido

1. Instala dependencias con `pnpm install` en cada carpeta.
2. Levanta la base de datos con `docker-compose up`.
3. Ejecuta los servidores backend y frontend con los scripts definidos en cada proyecto.