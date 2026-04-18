# Frontend - projeSpring

Proyecto frontend desarrollado con **Vite** y **React 18**.

## Requisitos
- Node.js 16+ 
- npm o yarn

## Instalación de Dependencias

```bash
npm install
# o
yarn install
```

## Desarrollo

Para ejecutar el servidor de desarrollo con hot reload:

```bash
npm run dev
# o
yarn dev
```

El proyecto se ejecutará en `http://localhost:5173`

## Construcción para Producción

```bash
npm run build
# o
yarn build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## Vista Previa de Producción

```bash
npm run preview
# o
yarn preview
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos del componente
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html           # HTML principal
├── vite.config.js       # Configuración de Vite
├── package.json         # Dependencias
└── .gitignore
```

## Features

- ⚡ Hot Module Replacement (HMR)
- ✨ Suporte para React 18
- 📦 Optimización automática de build
- 🔗 Proxy configurado para conectar con backend en `/api`
- 🎨 Estilos modernos con CSS puro

## Proxy del Backend

La configuración en `vite.config.js` redirige automáticamente las solicitudes a `/api/*` al servidor backend en `http://localhost:8080`.

### Ejemplo de uso

```javascript
// Cualquier solicitud a /api/hello
fetch('/api/hello')
  .then(res => res.json())
  .then(data => console.log(data))
```

Se convertirá en una solicitud a `http://localhost:8080/hello`

## Dependencias Principales

- **react**: 18.2.0
- **react-dom**: 18.2.0
- **axios**: 1.6.0 (opcional, para peticiones HTTP)

## DevDependencies

- **vite**: 5.0.0
- **@vitejs/plugin-react**: 4.2.0
