# Guía de Despliegue - PortalEmpleo API

## Despliegue en Render

### 1. Crear cuenta en Render
Ve a [render.com](https://render.com) y crea una cuenta.

### 2. Crear Base de Datos PostgreSQL
1. En el dashboard de Render, haz clic en "New +"
2. Selecciona "PostgreSQL"
3. Configura:
   - **Name**: `portalempleo-db`
   - **Region**: Selecciona la más cercana
   - **Plan**: Free (o el que prefieras)
4. Haz clic en "Create Database"
5. Guarda la **Internal Database URL** que aparecerá

### 3. Crear Web Service
1. En el dashboard, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `portalempleo-api`
   - **Region**: La misma que la base de datos
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build && npm run migration:run`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el que prefieras)

### 4. Configurar Variables de Entorno
En la sección "Environment", agrega:
```
NODE_ENV=production
PORT=3000
DB_HOST=<desde Internal Database URL>
DB_PORT=5432
DB_USERNAME=<desde Internal Database URL>
DB_PASSWORD=<desde Internal Database URL>
DB_DATABASE=<desde Internal Database URL>
JWT_SECRET=<genera-un-secret-seguro>
JWT_EXPIRES_IN=24h
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/opt/render/project/uploads
GEMINI_API_KEY=<tu-api-key>
```

**Nota**: La Internal Database URL tiene este formato:
```
postgresql://username:password@host:port/database
```

Puedes extraer cada parte de la URL:
- **DB_HOST**: La parte después de `@` y antes del `:`
- **DB_USERNAME**: La parte después de `://` y antes del `:`
- **DB_PASSWORD**: La parte después del primer `:` y antes del `@`
- **DB_DATABASE**: La parte después del último `/`

### 5. Configurar Volumen para Archivos (Opcional)
Si necesitas persistencia para archivos subidos:
1. En tu servicio, ve a "Settings" > "Disks"
2. Agrega un disco con:
   - **Mount Path**: `/opt/render/project/uploads`
   - **Size**: 1GB o más

### 6. Deploy
Haz clic en "Create Web Service". Render automáticamente:
- Instalará dependencias
- Compilará TypeScript
- Ejecutará migraciones
- Iniciará el servidor

Tu API estará disponible en: `https://portalempleo-api.onrender.com`

## Verificación Post-Despliegue

1. Verifica que el servicio esté corriendo:
```bash
curl https://tu-app.onrender.com/health
```

2. Verifica la conexión a la base de datos en los logs de Render

3. Prueba un endpoint de la API:
```bash
curl https://tu-app.onrender.com/api/v1
```

## Troubleshooting

### Error de Conexión a Base de Datos
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de usar la **Internal Database URL** (no la External)
- Verifica que ambos servicios estén en la misma región

### Migraciones no se ejecutan
- Revisa los logs del build
- Verifica que el build command incluya `npm run migration:run`
- Asegúrate de que TypeORM esté correctamente configurado

### Archivos subidos se pierden
- Los archivos en el filesystem de Render son efímeros en el plan Free
- Configura un volumen persistente (Disk) en Settings
- Considera usar un servicio externo como AWS S3 o Cloudinary

## Configuración de Dominio Personalizado (Opcional)

1. En tu servicio de Render, ve a "Settings" > "Custom Domain"
2. Agrega tu dominio
3. Configura los registros DNS según las instrucciones de Render

## Monitoreo y Logs

- Los logs están disponibles en tiempo real en el dashboard de Render
- Puedes configurar alertas de salud del servicio
- Render proporciona métricas básicas de uso

## Actualización de la Aplicación

Render se actualiza automáticamente con cada push a la rama configurada (main):
1. Haz commit de tus cambios
2. Push a GitHub
3. Render detectará el cambio y hará redeploy automáticamente

## Consideraciones de Producción

- Cambia el plan Free a uno de pago para evitar que el servicio se duerma
- Configura backups automáticos de la base de datos
- Implementa logging estructurado
- Configura monitoreo con herramientas como Sentry o LogRocket
- Considera usar Redis para caché si es necesario
