# Campus Mind

Aplicación móvil para organizar la vida universitaria: autenticación, horario de clases y seguimiento de materias.

El proyecto está construido con React Native y Expo, con Expo Router para la navegación, NativeWind para estilos y Supabase para autenticación y datos.

## Funcionalidades

- Registro e inicio de sesión con Supabase Auth.
- Persistencia de sesión en el dispositivo.
- Configuración de los días de asistencia a la universidad.
- Creación, consulta, edición y eliminación de clases.
- Detección de conflictos de horario.
- Fechas de inicio y término por materia.
- Colores y notas personalizadas para cada clase.
- Selector de fechas nativo para Android y iOS.
- Mostrar u ocultar la contraseña desde el formulario de autenticación.

Las secciones de tareas e IA todavía están en desarrollo.

## Requisitos

- Node.js y npm.
- Android Studio y un emulador o dispositivo Android para Android.
- Xcode y CocoaPods para iOS.
- Un proyecto de Supabase configurado.

## Instalación

```bash
npm install
```

Crea un archivo `.env.local` en la raíz del proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_clave_publishable
```

La clave debe ser una clave pública/publishable. Nunca coloques una `service_role` o una clave secreta en la aplicación móvil.

## Ejecutar la aplicación

Iniciar Expo:

```bash
npm start
```

Ejecutar directamente en una plataforma nativa:

```bash
npm run android
npm run ios
```

También puedes abrir el menú de Expo con `npm start` y escanear el QR desde Expo Go cuando el proyecto y el dispositivo estén en la misma red.

## Base de datos

La aplicación utiliza estas tablas públicas de Supabase:

### `profiles`

Guarda información del usuario y utiliza `auth.users.id` como llave primaria y foránea.

Campos principales:

- `id`
- `nombre_completo`
- `universidad`
- `carrera`
- `semestre`
- `created_at`

### `schedule_classes`

Guarda las clases del usuario.

Campos principales:

- `id`
- `user_id`
- `subject`
- `teacher`
- `classroom`
- `start_time`
- `end_time`
- `days` como arreglo de días de la semana (`0` domingo a `6` sábado)
- `color`
- `notes`
- `start_date`
- `end_date`
- `created_at`
- `updated_at`

La base de datos debe tener:

- RLS habilitado en `profiles` y `schedule_classes`.
- Policies para que cada usuario solo pueda consultar y modificar sus propios registros.
- Una restricción que garantice que `end_time` sea posterior a `start_time`.
- Un trigger que actualice automáticamente `updated_at`.
- Un trigger de registro de usuario si se desea crear automáticamente la fila correspondiente en `profiles`.

La configuración SQL se administra actualmente desde Supabase. Se recomienda convertirla en migraciones versionadas dentro del repositorio antes de desplegar a producción.

## Estructura del proyecto

```text
app/                 Rutas y pantallas de Expo Router
  (tabs)/            Navegación principal de la aplicación
  horario/           Lista, creación y detalle de clases
components/
  atoms/             Componentes pequeños reutilizables
  molecules/         Componentes compuestos
  organisms/         Formularios y bloques funcionales
  templates/         Composición de pantallas
hooks/               Estado y lógica reutilizable
services/            Acceso a Supabase y AsyncStorage
types/               Tipos de TypeScript
utils/               Validaciones, fechas y conflictos de horario
lib/                 Clientes y utilidades compartidas
theme/               Colores y configuración visual
assets/              Imágenes e iconos
```

## Comandos útiles

Verificar tipos:

```bash
npx tsc --noEmit
```

Revisar lint y formato:

```bash
npm run lint
```

Aplicar formato:

```bash
npm run format
```

## Flujo principal del horario

1. El usuario configura sus días de asistencia.
2. La configuración se guarda localmente con AsyncStorage.
3. Las clases se consultan desde `schedule_classes` usando la sesión activa.
4. Antes de guardar, la aplicación revisa empalmes de días, horas y fechas.
5. Supabase valida nuevamente la propiedad de cada registro mediante RLS.

## Estado del proyecto

El objetivo principal actual es la aplicación móvil para Android e iOS. La recuperación de contraseña, las tareas y la sección de IA todavía requieren trabajo adicional.
