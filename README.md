# projeSpring - Full Stack App

Proyecto full-stack con **frontend en Vite + React** y **backend en Spring Boot**.

## 📁 Estructura del Proyecto

```
projeSpring/
├── frontend/          # Aplicación React + Vite
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── README.md
│   └── .gitignore
│
└── backend/           # Servidor Spring Boot
    ├── src/
    ├── pom.xml
    ├── README.md
    └── .gitignore
```

## 🚀 Quick Start

### Opción 1: Ejecutar en Terminales Separadas

#### Terminal 1 - Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
El servidor estará en `http://localhost:8080/api`

#### Terminal 2 - Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
La app estará en `http://localhost:5173`

### Opción 2: Compilar Ambos

```bash
# Backend
cd backend
mvn clean compile

# Frontend
cd frontend
npm install
npm run build
```

## 📋 Requisitos Previos

### Backend
- ☕ Java 17 o superior
- 📦 Maven 3.6 o superior

### Frontend
- 📦 Node.js 16 o superior
- npm o yarn

## 🔗 Comunicación Frontend-Backend

El frontend ya está configurado para comunicarse con el backend:

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:8080/api`

El proxy en `vite.config.js` redirige automáticamente las llamadas a `/api/*` al backend.

### Ejemplo de Petición

```javascript
// En el frontend - esto se envía al backend
fetch('/api/hello')
  .then(res => res.json())
  .then(data => console.log(data))
```

## 📚 Documentación Adicional

- Ver [frontend/README.md](./frontend/README.md) para más detalles del frontend
- Ver [backend/README.md](./backend/README.md) para más detalles del backend

## 🛠️ Comandos Útiles

### Frontend
```bash
cd frontend
npm run dev        # Desarrollo
npm run build      # Build para producción
npm run preview    # Vista previa del build
npm run lint       # Linting
```

### Backend
```bash
cd backend
mvn spring-boot:run           # Ejecutar
mvn clean compile             # Compilar
mvn test                       # Pruebas
mvn clean package             # Construir JAR
java -jar target/backend-0.0.1.jar  # Ejecutar JAR
```

## 🌐 Endpoints Disponibles

### `/api/hello` (GET)
Retorna un mensaje de bienvenida.

**Respuesta:**
```json
{
  "message": "¡Hola desde Spring Boot! La conexión frontend-backend funciona correctamente.",
  "timestamp": "2024-03-29T10:30:00",
  "status": "success"
}
```

### `/api/hello` (POST)
Recibe datos JSON.

**Request:**
```json
{
  "name": "Test",
  "data": "example"
}
```

## 🔒 CORS

El backend está configurado para aceptar solicitudes desde el frontend en desarrollo (`http://localhost:5173`).

## 📝 Tecnologías

### Frontend
- ⚛️ React 18
- ⚡ Vite 5
- 🎨 CSS Moderno

### Backend
- 🍃 Spring Boot 3.2.0
- 🗄️ Spring Data JPA
- 💾 H2 Database
- 🧹 Lombok
- 🔧 Maven

## 👨‍💻 Desarrollo

El proyecto está configurado para desarrollo con:
- **Hot Reload** en el frontend (Vite HMR)
- **DevTools** en el backend (Spring Boot)

## 📦 Build para Producción

### Frontend
```bash
cd frontend
npm run build
# Los archivos estarán en frontend/dist/
```

### Backend
```bash
cd backend
mvn clean package
# El JAR estará en backend/target/backend-0.0.1.jar
```

## 🤝 Notas

- El frontend utiliza Axios (opcional) y Fetch API
- El backend tiene CORS habilitado para desarrollo
- Base de datos H2 en memoria para desarrollo (sin persistencia)
- Para producción, cambiar a una base de datos real (MySQL, PostgreSQL, etc.)

## 📄 Licencia

Este proyecto es un ejemplo educativo.
