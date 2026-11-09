Contacto Cero — App móvil

Aplicación móvil del proyecto Contacto Cero, un simulador de chat con tu ex por inteligencia artificial. Se conecta al backend Spring Boot desplegado en AWS.

Está desarrollada con React Native y Expo, en TypeScript.

Funcionalidades
Registro e inicio de sesión con sesión persistente (token guardado en SecureStore).
Chat con el simulador: envío de mensajes, respuesta del ex por ciclo de 5 minutos y consulta automática del historial mientras hay una respuesta pendiente.
Configuración del ex: nombre y foto (desde cámara, galería o URL).
Entrenamiento del modelo con dos métodos: capturas de WhatsApp (procesadas con OCR) o texto de un chat exportado.
Purga del historial con confirmación.
Sacudir el teléfono para recargar el chat.
Frase motivacional en el estado vacío, desde una API externa, con respaldo local si no responde.
Requisitos
Node.js 20 o superior.
npm.
La aplicación Expo Go en tu teléfono, con la misma versión de SDK que el proyecto.
Instalación
bash
cd mobile-app
npm install
Variables de entorno

Crea un archivo .env en la raíz de mobile-app (no lo subas a Git):

EXPO_PUBLIC_API_URL=https://simulador-eulogio.duckdns.org/api/v1

Expo solo expone al código las variables que empiezan con EXPO_PUBLIC_.

Ejecución
bash
npx expo start -c

Escanea el código QR con Expo Go (Android) o con la cámara (iOS). Si aparece un error de versión de SDK, consulta la sección de solución de problemas.

Scripts
Comando	Qué hace
npm start	Inicia el servidor de desarrollo de Expo.
npm run typecheck	Verifica tipos con TypeScript sin compilar.
Estructura
src/
  api/          instancia de axios e interceptores (token y 401)
  services/     llamadas a la API, sin lógica de React
  contexts/     sesión del usuario y notificaciones (toasts)
  hooks/        lógica de chat y sensores
  components/   componentes de chat, modales y elementos comunes
  screens/      pantallas: Login, Registro y Chat
  navigation/   navegación entre pantallas
  utils/        traducción de errores a mensajes amigables
  types/        tipos compartidos

Las capas siguen una regla: services solo llama a la API, hooks contienen la lógica, y screens y components solo muestran datos.

Sensores y API externa
Cámara y galería (expo-image-picker): para las fotos de perfil y las capturas de entrenamiento. Si se niega el permiso de cámara, la app muestra un mensaje y ofrece la galería.
Acelerómetro (expo-sensors): al sacudir el teléfono en el chat se recarga el historial. Si el sensor no está disponible, la función se desactiva sin mostrar error.
API externa: api.quotable.io, para la frase motivacional. Si falla, se usa una frase local.
Solución de problemas

“Project is incompatible with this version of Expo Go”
La versión de Expo Go del teléfono no coincide con el SDK del proyecto. Actualiza el proyecto al SDK que tenga tu Expo Go, o instala una versión de Expo Go compatible con el SDK actual.

“react-native@X expected version: Y”
Ejecuta npx expo install --fix para alinear las versiones de las dependencias.

La app no conecta con el backend
Revisa que EXPO_PUBLIC_API_URL esté bien escrita y que el backend responda en esa URL. Después reinicia con npx expo start -c, porque Expo lee las variables solo al arrancar.

El QR no funciona
Asegúrate de que el teléfono y la computadora estén en la misma red Wi-Fi. Si no lo están, usa el modo túnel con npx expo start --tunnel.

Notas
La app no guarda el token fuera de SecureStore.
El envío de mensajes es optimista: el mensaje aparece al instante y se revierte si falla.
Las respuestas del ex llegan con un ciclo de 5 minutos, por eso la app consulta el historial cada 30 segundos mientras haya un mensaje sin respuesta.
Licencia

Proyecto académico del curso CS2031 – Desarrollo Basado en Plataformas.
