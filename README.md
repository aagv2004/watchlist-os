# ⛩️ Watchlist-OS

Una aplicación Full-Stack diseñada para gestionar, organizar y centralizar tus listas de seguimiento de películas, series, anime y música. Integra datos en tiempo real mediante la API de TMDB y ofrece una interfaz moderna y responsiva.

## 🚀 Características Principales

- **Autenticación Segura:** Registro e inicio de sesión de usuarios utilizando JSON Web Tokens (JWT) y encriptación de contraseñas con bcrypt.
- **Gestión de Medios (CRUD):** Añade, visualiza, edita y elimina elementos de tu watchlist personal.
- **Integración con TMDB:** Búsqueda y autocompletado de información de películas y series utilizando la API de The Movie Database.
- **Módulo de Música:** Gestión de pistas musicales con soporte para visualización de letras.
- **Soporte Multilingüe:** Integración con servicios de traducción para descripciones y detalles del contenido.
- **Interfaz Moderna:** Diseño UI/UX construido con React y estilizado con Tailwind CSS.

## 🛠️ Tecnologías y Arquitectura (MERN Stack)

El proyecto está dividido en dos partes principales: Cliente (Frontend) y Servidor (Backend).

**Frontend (`/client`)**

- React.js (construido con Vite para máxima velocidad)
- Tailwind CSS (Estilos y diseño responsivo)
- Axios (Cliente HTTP para peticiones al backend)
- React Router (Navegación SPA)

**Backend (`/server`)**

- Node.js & Express.js (Servidor e infraestructura de la API)
- MongoDB & Mongoose (Base de datos NoSQL y modelado de objetos)
- JWT & Bcrypt (Seguridad y autenticación)
- Dotenv (Gestión de variables de entorno)

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener en tu máquina:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [MongoDB](https://www.mongodb.com/) (Instalación local o un clúster en MongoDB Atlas)
- Una clave de API de [TMDB](https://developer.themoviedb.org/docs)

## ⚙️ Instalación y Configuración local

**1. Clonar el repositorio**

```bash
git clone [https://github.com/tu-usuario/watchlist-os.git](https://github.com/tu-usuario/watchlist-os.git)
cd watchlist-os
```

**2. Configuración del Backend**

```bash
cd server
npm install
```

- Crea un archivo .env en la carpeta server/ con las siguientes variables:
  PORT=5000
  MONGO_URI=tu_string_de_conexion_mongodb
  JWT_SECRET=tu_secreto_super_seguro
  TMDB_API_KEY=tu_api_key_de_tmdb

**3. Inicia el servidor en modo desarrollo**

```bash
npm run dev
```

**4. Configuración del Frontend **

- Abre una nueva terminal y navega a la carpeta del cliente:

```bash
cd client
npm install
```

- Crea un archivo `.env` en la carpeta `client/` con las siguientes variables:
  VITE_API_URL=http://localhost:5000/api

- Inicia el entorno de desarrollo de vite:

```bash
npm run dev
```

## Estructura del Proyecto

watchlist-os/
├── client/ # Aplicación Frontend en React
│ ├── public/ # Recursos estáticos (svg, iconos)
│ └── src/
│ ├── api/ # Configuración de Axios
│ ├── components/ # Componentes reutilizables (Layout, Modales, Torii)
│ ├── context/ # React Context (AuthContext)
│ └── pages/ # Vistas principales (Dashboard, Login, Register)
└── server/ # API REST Backend en Node/Express
├── config/ # Configuración de la base de datos (db.js)
├── controllers/ # Lógica de las rutas (auth, items, tmdb, music)
├── middleware/ # Middlewares personalizados (auth, error handler)
├── models/ # Esquemas de Mongoose (User, Items)
└── routes/ # Definición de endpoints de la API
