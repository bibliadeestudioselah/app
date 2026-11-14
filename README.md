# 📖 Biblia de Estudio Selah

> *"Donde la pausa se convierte en encuentro"*

**Biblia de Estudio Selah** es una Aplicación Web Progresiva (PWA) diseñada para el estudio profundo de la Palabra de Dios. Funciona **100% offline**, es instalable en dispositivos Android como una app nativa y no requiere servidores ni bases de datos externas para su funcionamiento.

Este proyecto nace con el propósito de ofrecer una herramienta de estudio bíblico completa, sin fines de lucro, libre de publicidad y accesible para todos.

---

## ✨ Características Principales

- 📖 **Texto Bíblico Integrado**: Incluye la versión Reina-Valera 1960 (RVR1960), con las palabras de Dios y de Cristo resaltadas automáticamente en color rojo.
- 🔍 **Búsqueda Avanzada**: Motor de búsqueda local (MiniSearch) que ignora mayúsculas y tildes, permitiendo encontrar versículos por palabra, personaje o tema de forma instantánea.
- 🧠 **Asistente de Estudio (IA Local)**: Un sistema experto que analiza los versículos seleccionados ofreciendo contexto histórico, referencias cruzadas y aplicaciones prácticas, funcionando 100% offline.
- 📚 **Biblioteca de Estudio**:
  - Diccionario Bíblico ilustrado.
  - Enciclopedia Bíblica.
  - Mapas Bíblicos interactivos.
  - Concordancia Strong (Léxico hebreo y griego).
  - Bosquejos y esquemas de estudio por libro y tema.
- 🗓️ **Planes de Lectura**: Incluye planes canónico, cronológico e histórico, con seguimiento automático de progreso guardado en el dispositivo.
- 🎧 **Audio Profesional**: Reproductor integrado que permite descargar el audio de los capítulos a la memoria del teléfono (IndexedDB) para escucharlos sin consumir datos.
- 🕊️ **Versículo Diario**: Un versículo aleatorio cada día con la opción de recargar para obtener uno nuevo.
- 🌗 **Diseño y Personalización**: Interfaz tipo app nativa con temas Claro, Oscuro y Sepia. Tipografía ajustable y botones de acción rápida (favoritos, compartir, asistente).
- 💾 **100% Offline**: Todo el texto, diccionarios y progreso del usuario se almacenan localmente. El Service Worker actualiza la app en segundo plano automáticamente.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido sin frameworks pesados, priorizando el rendimiento y la ligereza:

- **HTML5 / CSS3 / JavaScript (Vanilla)**: Cero dependencias externas para la interfaz.
- **IndexedDB**: Base de datos local en el navegador para guardar favoritos, notas, planes de lectura y audios descargados.
- **MiniSearch**: Motor de búsqueda difusa local.
- **Service Worker**: Estrategia *Cache-First* para garantizar el funcionamiento offline y sincronización en segundo plano.
- **Periodic Background Sync API**: Búsqueda automática de actualizaciones diarias (4:00 PM).
- **GitHub Pages**: Plataforma de alojamiento estático y gratuito.

---

## 🚀 Instalación y Despliegue

### Requisitos Previos
No necesitas instalar nada. Solo necesitas un navegador web moderno y conexión a internet para la primera carga.

### Despliegue en GitHub Pages
1. Crea una organización en GitHub llamada `bibliadeestudioselah`.
2. Crea un repositorio público llamado `app`.
3. Sube todos los archivos del proyecto (incluyendo la carpeta `data`, `css`, `js` y los íconos).
4. Ve a **Settings > Pages** en tu repositorio.
5. En la sección "Branch", selecciona `main` (o `master`) y la carpeta `/root`.
6. Guarda los cambios. Tu app estará disponible en: `https://bibliadeestudioselah.github.io/app/`

### Instalación en Android (WebAPK o APK)
1. Abre la URL de tu GitHub Pages en **Chrome para Android**.
2. Toca el menú de tres puntos y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
3. La app se instalará como un WebAPK real (con su propio icono y pantalla completa).
4. Si deseas generar un archivo `.apk` descargable, puedes usar [PWABuilder](https://www.pwabuilder.com/) ingresando la URL de tu app.

---

## 📂 Estructura del Proyecto

```text
app/
├── index.html                  # Archivo principal
├── manifest.json               # Configuración de la PWA
├── service-worker.js           # Lógica offline y actualizaciones
├── README.md                   # Documentación
├── css/
│   ├── base.css                # Variables y estilos base
│   ├── themes.css              # Temas Claro, Oscuro y Sepia
│   ├── layout.css              # Estructura de la app
│   └── components.css          # Tarjetas, botones, reproductor, etc.
├── js/
│   ├── minisearch.min.js       # Librería de búsqueda
│   ├── db.js                   # Gestión de IndexedDB
│   ├── theme.js                # Control de temas
│   ├── router.js               # Navegación entre vistas
│   ├── bible.js                # Lector bíblico
│   ├── search.js               # Lógica de búsqueda
│   ├── assistant.js            # Asistente de estudio
│   ├── library.js              # Diccionario, mapas, etc.
│   ├── plans.js                # Planes de lectura
│   ├── audio.js                # Reproductor de audio
│   └── app.js                  # Inicialización y configuración
├── data/
│   ├── RVR1960.json            # Texto bíblico completo
│   ├── library.json            # Diccionario, enciclopedia y mapas
│   ├── plans.json              # Estructura de planes de lectura
│   ├── announcement.json       # Cartelón de anuncios
│   └── audio-map.json          # Enlaces de descarga de audio
└── icons/                      # Íconos de la app (192x192, 512x512)