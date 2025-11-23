# PortalEmpleo API

Backend REST API para una plataforma de marketplace de empleos que conecta candidatos con oportunidades laborales y permite a empresas gestionar procesos de contratación.

## Características Principales

- Autenticación y autorización basada en JWT con roles (candidato, empresa, admin)
- Gestión completa de ofertas de empleo
- Sistema de CVs con carga y procesamiento de archivos PDF
- Gestión de solicitudes y estados de aplicaciones
- Programación y seguimiento de entrevistas
- Integración con IA para análisis de CVs
- API REST documentada y extensible

## Stack Tecnológico

- **Runtime:** Node.js 18+
- **Lenguaje:** TypeScript
- **Framework:** Express.js
- **Base de datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** JWT (JSON Web Tokens)
- **Procesamiento de archivos:** Multer, PDF-Parse
- **IA:** Google Generative AI (Gemini)
- **Testing:** Jest + Supertest
- **Validación:** Roles y permisos granulares

## Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd api-empleo
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones. Ver `.env.example` para más detalles.

4. Crear la base de datos:
```bash
createdb portalempleo
```

5. Ejecutar migraciones:
```bash
npm run migration:run
```

6. (Opcional) Ejecutar seeds para datos de prueba:
```bash
npm run seed
```

7. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm test` - Ejecuta los tests
- `npm run test:watch` - Ejecuta tests en modo watch
- `npm run test:coverage` - Genera reporte de cobertura
- `npm run migration:run` - Ejecuta migraciones pendientes
- `npm run migration:revert` - Revierte la última migración
- `npm run seed` - Ejecuta seeds de datos

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuarios
- `POST /api/v1/auth/login` - Login

### Usuarios
- `GET /api/v1/users` - Lista de usuarios
- `GET /api/v1/users/:id` - Detalle de usuario
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario

### CVs
- `POST /api/v1/cvs` - Subir CV
- `GET /api/v1/cvs/:id` - Obtener CV

### Jobs
- `GET /api/v1/jobs` - Lista de trabajos
- `POST /api/v1/jobs` - Crear trabajo
- `GET /api/v1/jobs/:id` - Detalle de trabajo
- `PUT /api/v1/jobs/:id` - Actualizar trabajo
- `DELETE /api/v1/jobs/:id` - Eliminar trabajo

### Applications
- `POST /api/v1/applications` - Aplicar a un trabajo
- `GET /api/v1/applications` - Lista de aplicaciones
- `GET /api/v1/applications/:id` - Detalle de aplicación

### Interviews
- `POST /api/v1/interviews` - Programar entrevista
- `GET /api/v1/interviews` - Lista de entrevistas
- `PUT /api/v1/interviews/:id` - Actualizar entrevista

## Estructura del Proyecto

```
api-empleo/
├── src/
│   ├── config/          # Configuraciones (database, etc.)
│   ├── controllers/     # Controladores de rutas
│   ├── entities/        # Entidades de TypeORM
│   ├── middleware/      # Middlewares (auth, upload, etc.)
│   ├── migrations/      # Migraciones de base de datos
│   ├── routes/          # Definición de rutas
│   ├── seeds/           # Seeds de datos
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades
│   └── index.ts         # Punto de entrada
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

Ejecutar todos los tests:
```bash
npm test
```

Tests con cobertura:
```bash
npm run test:coverage
```

## Arquitectura y Seguridad

### Roles y Permisos

- **Candidato (candidate):** Crear y gestionar CVs, aplicar a empleos, ver estado de solicitudes
- **Empresa (company):** Crear ofertas de empleo, revisar solicitudes, programar entrevistas
- **Admin:** Acceso completo al sistema

### Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación mediante tokens JWT Bearer
- Middleware de autorización basado en roles
- Validación de entrada en todos los endpoints
- CORS configurado
- Rate limiting recomendado para producción

## API Reference

### Health Check

```http
GET /health
```

Retorna el estado del servidor.

### Autenticación

**Registro**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword",
  "name": "John Doe",
  "role": "candidate"
}
```

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword"
}
```

### Jobs

**Listar empleos (público)**
```http
GET /api/v1/jobs
```

**Crear empleo (empresa)**
```http
POST /api/v1/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Developer",
  "description": "Job description...",
  "requirements": "Requirements...",
  "salary": 80000,
  "location": "Remote"
}
```

Ver documentación completa de endpoints en el código fuente.

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código TypeScript
- Escribe tests para nuevas funcionalidades
- Mantén la cobertura de tests >80%
- Documenta cambios significativos en el código

## Licencia

ISC
