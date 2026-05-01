# Instrucciones para ejecutar el proyecto sin Maven instalado

## Opción 1: Maven Wrapper (Automático)

El proyecto ahora incluye Maven Wrapper. No necesitas instalar Maven.

### En PowerShell:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### En CMD:
```
cd backend
mvnw.cmd spring-boot:run
```

## Opción 2: Scripts Batch (Más fácil)

Abre dos terminales en la carpeta raíz del proyecto:

**Terminal 1 - Backend:**
```
run-backend.bat
```

**Terminal 2 - Frontend:**
```
run-frontend.bat
```

## Opción 3: Docker (Sin instalar nada en local)

Si tienes Docker instalado:

```powershell
cd backend
docker build -t projespring-backend .
docker run -p 8080:8080 projespring-backend
```

## Requisitos Mínimos

- ☕ Java 17 o superior (para el backend)
- 📦 Node.js 16+ (para el frontend - ya configurado)
- MySQL (para la base de datos)

## Pasos para Empezar

1. **Crea la base de datos MySQL:**
   ```sql
   CREATE DATABASE projespring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Ejecuta el backend:**
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

3. **En otra terminal, ejecuta el frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

4. **Abre en el navegador:**
   ```
   http://localhost:5173
   ```

¡Listo! El frontend se conectará automáticamente con el backend.
