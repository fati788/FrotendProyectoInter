# 🌱 SISTEMA DE MONITORIZACIÓN DE SENSORES Y PLAGAS 🌱

Dashboard de gestión y monitoreo de sistemas de riego industrial y plagas mediante sensores y cámaras IoT. 
Programado en la parte del backend con Java Spring Boot y conectado con los sensores mediante un broker MQTT.

## Descripción 📋

Se trata de una aplicación web con un entorno de frontend programado en React + Vite. Este conjunto de aplicaciones forman un entorno cliente-servidor que nos permite:

- Visualizar datos de los sensores IoT y sus lecturas en tiempo real.
- Tener una representación gráfica de los datos gracias a **Recharts** y sus gráficas interactivas.
- Monitorizamos los sistemas de riego y autollenado de balsas.
- Podemos controlar en tiempo real los actuadores.
- Integración de una cámara IA-API para el control de plagas.


## Características del proyecto 📝

- Pantalla principal donde ver un resumen visual de tus balsas y sectores.
- Acceso a información más específica de cada sensor.
- Detalles de las lecturas de los sensores con gráficas formadas por históricos de datos.
- Control manual de los riegos mediante los actuadores.
- Información sobre la previsión del tiempo.
- Interfaz intuitiva y moderna.
- Manejo de errores y excepciones.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu sistema todo lo siguiente antes de continuar:

### Frontend
| Herramienta | Versión mínima | Notas |
|---|---|---|
| **Node.js** | >= 20.x | [Descargar](https://nodejs.org/) |
| **npm** | >= 10.x | Incluido con Node.js |

### Backend
| Herramienta | Versión mínima | Notas |
|---|---|---|
| **JDK** | 25 | [Eclipse Temurin 25](https://adoptium.net/) recomendado |
| **Gradle** | — | Usar el wrapper `./gradlew` incluido en el proyecto |

### Infraestructura
| Servicio | Descripción | Puerto |
|---|---|---|
| **MariaDB** | Base de datos relacional. Se gestiona como contenedor Podman | `3308` |
| **Eclipse Mosquitto** | Broker MQTT para recepción de lecturas de sensores | `1883` |
| **Podman** | Gestor de contenedores (alternativa a Docker) | — |

> **Nota:** La cámara IA de detección de plagas es un servicio externo (`https://chinches.caserita-j.es`). No requiere instalación local, solo conexión a internet.

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <https://github.com/Marcos25893/ProyectoFinalSensores>
git clone <https://github.com/fati788/FrotendProyectoInter>
cd ProyectoFinalSensores   # o el nombre del directorio raíz
```

### 2. Levantar la base de datos (MariaDB)

La base de datos corre en un contenedor Podman. Si es la primera vez, créalo:

```bash
podman run -d \
  --name ProyectoFinal \
  -e MYSQL_ROOT_PASSWORD=root1234 \
  -e MYSQL_DATABASE=sensoresapi \
  -e MYSQL_USER=usuario \
  -e MYSQL_PASSWORD=usuario1234 \
  -p 3308:3306 \
  docker.io/library/mariadb:latest
```

En arranques posteriores basta con:

```bash
podman start ProyectoFinal
```

Verifica que el contenedor está corriendo:

```bash
podman ps
```

### 3. Levantar el broker MQTT (Mosquitto)

El repositorio incluye la configuración de Mosquitto en `mosquitto/config/mosquitto.conf`. Lanza el contenedor desde la raíz del proyecto:

```bash
podman run -d \
  --name mqtt-broker \
  -p 1883:1883 \
  -v ./mosquitto/config:/mosquitto/config/ \
  docker.io/eclipse-mosquitto:latest
```

La configuración permite conexiones anónimas en el puerto `1883`. En arranques posteriores:

```bash
podman start mqtt-broker
```

### 4. Compilar y arrancar el backend (Spring Boot)

Desde la raíz del proyecto backend (`ProyectoFinalSensores/`):

```bash
./gradlew bootRun
```

O para generar el JAR y ejecutarlo directamente:

```bash
./gradlew build
java -jar build/libs/*.jar
```

El servidor quedará disponible en `http://localhost:8080`.

### 5. Instalar y arrancar el frontend (React)

Desde la raíz del proyecto frontend (`FrotendProyectoInter/`):

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

> El backend debe estar corriendo en `http://localhost:8080` antes de abrir el frontend.

---

## ⚙️ Configuración

### Backend — `application.properties`

El archivo se encuentra en `src/main/resources/application.properties`. Los parámetros que necesitas ajustar según tu entorno:

```properties
# ── Base de datos ─────────────────────────────────────────────────
spring.datasource.url=jdbc:mariadb://localhost:3308/sensoresapi
spring.datasource.username=usuario
spring.datasource.password=usuario1234

# ── Broker MQTT ───────────────────────────────────────────────────
# Desarrollo local:
mqtt.host=localhost
# Producción (IP del servidor AWS o red local):
# mqtt.host=10.0.0.11
mqtt.port=1883

# ── CORS (orígenes permitidos) ────────────────────────────────────
cors.allowed-origins=http://localhost:5173,http://localhost:3000

# ── API externa: cámara de detección de plagas ───────────────────
camara.url=https://chinches.caserita-j.es
```

### Frontend — URL del backend

La URL base del backend se configura en `src/api/apiservice.jsx`:

```javascript
// Desarrollo local
const API_BASE_URL = 'http://localhost:8080/';

// Producción (sustituye por la IP pública de tu servidor)
// const API_BASE_URL = 'http://<IP-PUBLICA>:8080/';
```

### Tipos de sensores soportados

El sistema reconoce los siguientes tipos (`TipoSensor`):

| Tipo | Descripción |
|---|---|
| `BOMBA` | Actuador — bomba de agua |
| `ELECTROVALVULA` | Actuador — electroválvula de riego |
| `EV_NUTRIENTES` | Actuador — electroválvula de nutrientes |
| `HUMEDAD` | Sensor de humedad del suelo |
| `TEMPERATURA` | Sensor de temperatura ambiente |
| `PRESION` | Sensor de presión |
| `CAUDAL` | Sensor de caudal |
| `CONDUCTIVIDAD` | Sensor de conductividad eléctrica |
| `NIVEL` | Sensor de nivel de balsa |
| `PLUVIOMETRIA` | Pluviómetro |
| `VIENTO` | Anemómetro (velocidad) |
| `DIR_VIENTO` | Sensor de dirección del viento |
| `HUMEDAD_EXTERNA` | Humedad ambiental exterior |
| `PRESION_EXTERNA` | Presión atmosférica exterior |

### Formato de mensajes MQTT

Los sensores publican sus lecturas en topics con el formato:

```
<sector>/<numero_sensor>/<tipo>
```

Ejemplo: `0/101/1` corresponde a la balsa (nivel) con ID 6. El payload es el valor numérico en texto plano:

```
130
```

> Cada tipo de sensor aplica transformaciones y rangos de validación específicos en el backend antes de guardar la lectura en base de datos.

## 📁 Estructura del Proyecto

```
FrotendProyectoInter/
├── public/                              # Archivos estáticos públicos
├── src/
│   ├── api/
│   │   └── apiservice.jsx              # Cliente Axios + todos los servicios REST
│   ├── assets/
│   │   ├── img/
│   │   │   └── logoJaroso.png          # Logo de la aplicación
│   │   └── imagenes.jsx                # Exportación centralizada de assets
│   ├── components/
│   │   ├── AppShell.jsx                # Layout global: cabecera, navegación, widget de clima
│   │   ├── CamaraPage.jsx              # Página de detección de plagas (cámara IA)
│   │   ├── ChartTooltip.jsx            # Tooltip personalizado para las gráficas
│   │   ├── ChartView.jsx               # Vista de gráfica de lecturas históricas
│   │   ├── EsquemaBalsasIndustrial.jsx # Esquema visual SVG del estado de las balsas
│   │   ├── IoTDashboard.jsx            # Página principal del dashboard
│   │   ├── SectoresPanel.jsx           # Panel de tarjetas de sectores
│   │   ├── SectorScadaIndustrial.jsx   # Vista SCADA detallada de un sector
│   │   ├── SensorCardLecturas.jsx      # Tarjeta de sensor con historial de lecturas
│   │   ├── SensorDetailPanel.jsx       # Página de detalle de sensor / sector
│   │   ├── SensoresPage.jsx            # Página de listado completo de sensores
│   │   ├── SensorIcon.jsx              # Iconos SVG por tipo de sensor
│   │   ├── Sparkline.jsx               # Mini-gráfica sparkline inline
│   │   └── TableView.jsx               # Vista en tabla de lecturas
│   ├── constants/
│   │   ├── palette.js                  # Paleta de colores por tipo de sensor
│   │   ├── sensorMeta.js               # Metadatos: unidades y rangos por tipo
│   │   └── statusConfig.js             # Configuración de estados (colores, etiquetas)
│   ├── App.js                          # Contexto de tema (dark/light) + rutas React Router
│   ├── App.css                         # Estilos globales
│   ├── index.js                        # Punto de entrada
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🔌 Endpoints del Backend Requeridos

El backend Spring Boot debe estar corriendo en `http://localhost:8080`. Estos son todos los endpoints que consume el frontend:

### Sensores — `/sensor`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sensor` | Obtener todos los sensores |
| `GET` | `/sensor/{id}` | Obtener sensor por ID |
| `GET` | `/sensor/bySectorId/{sectorId}` | Sensores de un sector |
| `POST` | `/sensor` | Crear nuevo sensor |
| `PUT` | `/sensor/sensores/{id}` | Actualizar estado de un sensor/actuador |
| `DELETE` | `/sensor/{id}` | Eliminar sensor |

### Lecturas — `/lectura`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/lectura` | Obtener todas las lecturas |
| `GET` | `/lectura/bySensorId/{sensorId}` | Lecturas de un sensor |
| `POST` | `/lectura/bySensorIdAndFecha` | Lecturas filtradas por rango de fechas |
| `POST` | `/lectura` | Crear lectura manual |

Body para filtrar por fecha:
```json
{
  "sensorId": 1,
  "fechaDesde": "2025-01-01T00:00:00",
  "fechaHasta": "2025-12-31T23:59:59"
}
```

### Sectores — `/sectores`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sectores` | Obtener todos los sectores |
| `GET` | `/sectores/{id}` | Obtener sector por ID |
| `POST` | `/sectores` | Crear sector |
| `DELETE` | `/sectores/{id}` | Eliminar sector |

### Automatización — `/automatizar`

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/automatizar/actuadores` | Solicitar cambio de estado de un actuador |
| `GET` | `/automatizar/modo` | Obtener modo de riego (`true` = automático) |
| `POST` | `/automatizar/modo?automatico=true` | Activar/desactivar riego automático |

Body para `/automatizar/actuadores`:
```json
{
  "id": 1,
  "estado": "ACTIVO"
}
```

Respuesta:
```json
{
  "permiso": true,
  "motivo": "Válvula abierta correctamente",
  "nuevoEstado": "ACTIVO"
}
```

### Cámara IA — `/camara`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/camara/latest` | Última detección con coordenadas de insectos |
| `GET` | `/camara/health` | Estado del servicio de cámara |
| `GET` | `/camara/events?limit=50` | Historial de eventos de detección |
| `GET` | `/camara/stats?limit=288` | Estadísticas agregadas del período |

---

## Despliegue
(De momento aquí nada)

## Consideraciones de seguridad
(Aqui nada)

---

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---|---|---|
| `react` | ^19.2.4 | Framework UI |
| `react-dom` | ^19.2.4 | Renderizado en el DOM |
| `react-router-dom` | ^6.30.3 | Enrutamiento SPA |
| `axios` | ^1.13.6 | Cliente HTTP para llamadas al backend |
| `recharts` | ^3.7.0 | Gráficas interactivas de lecturas |
| `chart.js` | ^4.5.1 | Motor de gráficas complementario |
| `react-chartjs-2` | ^5.3.1 | Wrapper React para Chart.js |
| `chartjs-adapter-date-fns` | ^3.0.0 | Adaptador de fechas para ejes temporales |
| `framer-motion` | ^12.38.0 | Animaciones de interfaz |
| `react-scripts` | 5.0.1 | Toolchain Create React App |
| `tailwindcss` | ^3.4.4 | Utilidades CSS (complementa estilos inline) |

---

## 📝 Logs y Monitoreo

La aplicación registra en la consola del navegador (`F12 → Consola`):

- Peticiones de recarga de sensores: `"Recargando sensores..."`
- Errores de conexión con el backend: cada servicio en `apiservice.jsx` registra el error con `console.error`
- Errores de parsing o respuestas inesperadas de la API

Para ver los logs en producción, abre las herramientas de desarrollador del navegador (`F12`) y filtra por `Error` o por la URL del backend.

> En un entorno de producción real se recomendaría integrar una herramienta de error tracking como **Sentry** para capturar excepciones sin necesidad de acceder a las DevTools del cliente.
