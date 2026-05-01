on# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gestion-PFA** is a university final-year project (PFA) defense management system. It implements a 4-phase workflow:
- **Phase 1** – Subject assignment validation (`Affectation`)
- **Phase 2** – Time slot creation & professor availability (`Creneau`, `DisponibiliteProf`)
- **Phase 3** – Defense scheduling with jury assignment (`Soutenance`)
- **Phase 4** – Results recording & grading (`PlanningFinal`)

Dual interfaces: Admin and Professor views. Features include real-time notifications, messaging (Chat), and calendar-based scheduling.

---

## Stack

- **Backend**: Spring Boot 4.0.5, Java 17, Spring Data JPA (Hibernate), MySQL
- **Frontend**: React 19.2.4 + Vite 8.0.3, FullCalendar 6.1.20, lucide-react

---

## Commands

### Backend

```bash
# Run (requires MySQL running with pfa_db database)
./mvnw spring-boot:run          # Linux/macOS
mvnw.cmd spring-boot:run        # Windows

# Build
./mvnw clean package

# Test
./mvnw test
```

Backend runs on **http://localhost:8081**.

**Database setup**: Create MySQL database `pfa_db`. Copy `src/main/resources/application.properties.example` to `application.properties` and configure credentials (default: root/user). The `application.properties` file is gitignored.

### Frontend

```bash
cd gestion-pfa-front
npm install
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run preview  # preview production build
```

---

## Architecture

### Backend (`src/main/java/com/pfa/gestion_pfa/`)

```
controller/   REST API endpoints (10 controllers)
model/        JPA entities (11 models + 3 enums)
repository/   Spring Data JPA repos (11 interfaces)
service/      Business logic (3 services)
config/       CORS config — allows localhost:3000 on /api/**
```

CORS is configured to allow only `http://localhost:3000`. All API routes are prefixed with `/api`.

**Entities use JOINED inheritance** — `Utilisateur` is the base with `Etudiant` and `Professeur` as subtypes. Role enum: `ADMIN`, `ETUDIANT`, `PROFESSEUR`.

Key domain logic lives in the **model layer** (not just services):
- `Creneau.chevauche()` / `aConflitJury()` — conflict detection for time slots
- `Affectation.valider()` / `refuser()` / `modifier()` — state machine for subject assignment
- `DisponibiliteProf.couvre()` / `estEnConflit()` — availability matching
- `Soutenance.encadrantDansJury()` / `terminer()` / `annuler()` — defense lifecycle

### Frontend (`gestion-pfa-front/src/`)

```
App.jsx           Admin interface (main entry point)
LoginPage.jsx     Authentication
api/api.jsx       API client — 9 modules, base URL http://localhost:8081/api
components/       17 components split between admin and professor views
```

**API client** (`api/api.jsx`) is organized into modules: `authApi`, `creneauApi`, `professeurApi`, `disponibiliteApi`, `sujetApi`, `affectationApi`, `soutenanceApi`, `chatApi`, `notificationApi`.

**Professor interface** components are prefixed with `Prof` (e.g., `ProfApp.jsx`, `ProfDisponibilites.jsx`).

Shared UI primitives live in `components/ui.jsx` and `components/Badges.jsx`.

### Auth Flow

`authApi.login()` / `authApi.me()` — no JWT library is used; check `AuthController` for the current session mechanism.

---

## Key Conventions

- `application.properties` is gitignored — use `application.properties.example` as the template.
- Hibernate `ddl-auto=update` is active — schema changes to entities will auto-migrate the DB in dev.
- `@JsonIgnore` is used on bidirectional JPA relationships to prevent serialization cycles.
- Lombok `@Data` / `@RequiredArgsConstructor` reduce boilerplate on entities and services.
- Frontend uses `lucide-react` for all icons; avoid adding other icon libraries.
