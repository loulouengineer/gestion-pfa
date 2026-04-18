@echo off
REM Script para ejecutar el backend de Spring Boot
cd backend
echo Ejecutando Backend Spring Boot...
call mvnw.cmd spring-boot:run
pause
