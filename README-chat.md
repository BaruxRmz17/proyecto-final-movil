# Contexto de trabajo para otros modelos de IA

Este archivo resume el contexto actual de Campus Mind para que otro modelo pueda continuar el proyecto sin perder decisiones, arquitectura ni criterios de UX/UI.

## 1. Qué es Campus Mind

Campus Mind es una aplicación móvil para estudiantes universitarios. Su objetivo es centralizar:

- Perfil y tarjeta de estudiante.
- Horario de clases.
- Tareas y fechas de entrega.
- Recordatorios locales.
- Calificaciones capturadas manualmente.
- Promedio general y promedio por materia.

El enfoque principal es móvil, especialmente iOS usando Expo Go. La versión web no es prioridad académica.

## 2. Stack actual

- React Native.
- Expo SDK 58.
- Expo Router.
- Expo Go SDK 58 para pruebas en dispositivo.
- NativeWind/Tailwind para estilos.
- Supabase Auth y Postgres.
- @supabase/supabase-js.
- Redux Toolkit solamente para el perfil y estado global puntual.
- CRUD de tareas y horario mediante hooks y servicios locales.
- expo-secure-store para persistir la sesión en móvil.
- AsyncStorage para configuraciones locales y estado de notificaciones.
- expo-notifications para recordatorios locales.
- TypeScript y ESLint.

Versiones principales:

```text
expo                 ^58.0.17
expo-router          ~58.0.25
react                19.3.0
react-native         0.88.0
expo-secure-store    ~58.0.2
expo-notifications   ~58.1.6
```

## 3. Reglas antes de modificar

1. Es un proyecto móvil. Priorizar iOS y Android sobre web.
2. No agregar otra pestaña inferior sin justificarlo. Actualmente ya existen cinco.
3. No usar Redux para cada CRUD. Redux se usa para el perfil; tareas y horario usan servicios y hooks.
4. No inventar calificaciones ni datos académicos.
5. No guardar ni mostrar claves secretas.
6. Nunca colocar service_role o sb_secret en la app móvil.
7. La app debe usar EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
8. No tocar .env para subirlo a Git. Está ignorado.
9. No hacer git push o commits si el usuario no lo solicita explícitamente.
10. Antes de cambiar navegación, revisar las rutas tipadas de Expo Router.
11. Mantener los textos y botones cómodos para pantallas pequeñas de iPhone.
12. Después de cambios relevantes ejecutar TypeScript, ESLint y git diff --check.

## 4. Navegación actual

El menú inferior está en `app/(tabs)/_layout.tsx` y contiene:

- Inicio.
- Horario.
- Tareas.
- IA.
- Perfil.

Calificaciones no es una pestaña inferior. Es una ruta secundaria:

```text
app/calificaciones/index.tsx
```

Se puede abrir desde:

- Tarjeta de calificaciones en Inicio.
- Opción de rendimiento académico en Perfil.

Las rutas de tareas son:

```text
app/tareas/nueva.tsx
app/tareas/editar.tsx
app/tareas/[id].tsx
```

## 5. UX/UI actual

### Estilo visual

- Fondo principal: `#FAF9FF`.
- Texto principal: `#292342`.
- Texto secundario: `#817995`.
- Color primario: `#7957DC`.
- Fondo lavanda: `#EDE6FF`.
- Bordes suaves: `#EAE6F3`.
- Tarjetas blancas con bordes redondeados.
- Botones grandes, táctiles y fáciles de leer.

### Principios de experiencia

- Mostrar estados de carga.
- Mostrar estados vacíos útiles.
- Mostrar errores con botón de reintento.
- Usar calendarios y selectores nativos para fechas y horas.
- Evitar formularios largos cuando se puedan dividir en secciones.
- En detalles con muchas acciones, usar dos botones por fila.
- Mantener visible la navegación de regreso en rutas secundarias.
- Confirmar acciones destructivas como eliminar o archivar.
- No presentar calificaciones manuales como calificaciones oficiales.

## 6. Autenticación y sesión

El cliente de Supabase está en:

```text
lib/supabase.ts
```

Configuración:

```text
persistSession: true
autoRefreshToken: true
detectSessionInUrl: false
```

El adaptador está en:

```text
lib/secureAuthStorage.ts
```

En móvil utiliza SecureStore con valores divididos en fragmentos porque los tokens pueden superar el límite de almacenamiento de iOS. También migra sesiones antiguas guardadas con AsyncStorage.

En web usa AsyncStorage como fallback.

El archivo `app/index.tsx` revisa la sesión al abrir la ruta raíz. Si existe una sesión, redirige a `(tabs)` para evitar que el usuario vea la bienvenida después de recargar.

Variables esperadas:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
```

No copiar valores reales de .env a este archivo.

## 7. Modelo de datos de Supabase

### profiles

Perfil del usuario. `id` referencia `auth.users(id)`.

Campos:

- id
- nombre_completo
- universidad
- carrera
- semestre
- avatar_color
- avatar_emoji
- created_at

La tarjeta de estudiante permite cambiar color y emoji. Las opciones válidas están en `types/profile.ts` y en la restricción SQL.

### schedule_classes

Materias del horario.

Campos:

- id
- user_id
- subject
- teacher
- classroom
- start_time
- end_time
- days
- color
- notes
- start_date
- end_date
- created_at
- updated_at

### tasks

Tareas relacionadas con una materia.

Campos:

- id
- user_id
- class_id
- title
- description
- due_date
- due_time
- priority: low, medium o high.
- status: pending o completed.
- archived: oculta tareas archivadas de la lista principal.
- grade: calificación obtenida, opcional.
- grade_max: puntuación máxima, normalmente 100.
- created_at
- updated_at

La calificación se captura manualmente en la tarea, por ejemplo 85 / 100.

## 8. Calificaciones

La app no obtiene notas directamente de Google Classroom. El flujo actual es manual:

1. El usuario crea o edita una tarea.
2. Captura calificación obtenida y máxima.
3. La tarea se guarda en tasks.
4. `app/calificaciones/index.tsx` consulta tareas con grade distinto de null.
5. Las agrupa por class_id.
6. Calcula promedio por materia usando puntos obtenidos entre puntos posibles.
7. Calcula promedio general con el mismo criterio ponderado.

La pantalla muestra:

- Promedio general.
- Cantidad de materias con notas.
- Cantidad de actividades calificadas.
- Promedio por materia.
- Barra visual de avance.
- Detalle de tareas y sus notas.

La calificación es una referencia personal basada en datos capturados por el usuario; no debe presentarse como nota oficial.

## 9. Migraciones existentes

```text
supabase/migrations/20261021215647_tasks_rls_and_indexes.sql
supabase/migrations/20261022203529_profile_avatar_customization.sql
supabase/migrations/20261022204918_task_archiving.sql
supabase/migrations/20261022225000_task_grades.sql
```

Las dos últimas agregan archivado, calificaciones, validaciones e índices.

Si no se utiliza Supabase CLI, ejecutar el contenido de las migraciones nuevas desde el SQL Editor antes de probar esas funciones.

## 10. Seguridad actual

La app usa una llave pública/publishable y depende de RLS para proteger los datos. La llave pública no es un secreto; una service_role o sb_secret sí lo es.

Las políticas de tasks están versionadas en:

```text
supabase/migrations/20261021215647_tasks_rls_and_indexes.sql
```

Antes de producción, confirmar RLS en:

- profiles.
- schedule_classes.
- tasks.

También confirmar que cada usuario solo pueda leer y modificar sus propios registros.

Pendientes de seguridad conocidos:

1. Versionar en migraciones las políticas de profiles y schedule_classes si todavía solo existen en el SQL Editor.
2. Reforzar a nivel de base de datos que tasks.class_id pertenezca a una materia del mismo user_id. No depender únicamente de la validación de la app.
3. Rotar cualquier service_role antigua que haya sido expuesta.
4. Considerar mover el estado de notificaciones de AsyncStorage a almacenamiento más protegido si se guardan más datos sensibles.
5. La app usa actualmente una llave legacy anon; migrar a sb_publishable cuando sea posible.

## 11. Notificaciones

El servicio está en:

```text
services/taskNotificationsService.ts
```

Características:

- Recordatorio un día antes.
- Recordatorio una hora antes.
- Cancelación al eliminar o completar.
- Reconciliación con tareas pendientes.
- Cola para evitar escrituras simultáneas sobre AsyncStorage.
- Estado visual en la lista y detalle de tareas.

Las notificaciones son un efecto secundario. Guardar la tarea en Supabase es la operación principal. Si falla una notificación, la tarea no debe aparecer como fallida.

Expo Go tiene limitaciones con expo-notifications. Para pruebas completas considerar un development build.

## 12. Organización del código

```text
app/                 Pantallas y rutas Expo Router
components/          Componentes visuales reutilizables
hooks/               Lógica de estado local y operaciones de pantalla
services/            Supabase, tareas, horario y notificaciones
store/               Redux puntual, principalmente perfil
types/               Tipos de dominio
utils/               Fechas y utilidades
lib/                 Supabase, SecureStore y configuración compartida
supabase/migrations/ Cambios versionados de base de datos
```

Servicios relevantes:

```text
services/tasksService.ts
services/scheduleClassesService.ts
services/taskNotificationsService.ts
services/scheduleStorage.ts
```

## 13. Comandos de validación

Después de cambios importantes:

```bash
npx tsc --noEmit --pretty false
npx eslint .
git diff --check
```

Para iniciar Expo Go:

```bash
npx expo start -c
```

Para revisar dependencias:

```bash
npm ls --depth=0
npx expo install --check
```

## 14. Flujo recomendado para continuar

Antes de programar:

1. Revisar `git status --short`.
2. Leer la pantalla y servicio relacionados.
3. Confirmar si el cambio es visual, lógico o de base de datos.
4. Si implica Supabase, revisar RLS y preparar migración.
5. No asumir que una tabla remota ya tiene columnas nuevas.

Después de programar:

1. Ejecutar TypeScript.
2. Ejecutar ESLint.
3. Revisar `git diff --check`.
4. Probar el flujo principal en iOS.
5. Informar claramente si el usuario debe ejecutar SQL.
6. No subir a Git hasta que el usuario lo solicite.

## 15. Siguiente trabajo recomendado

Prioridad alta:

- Versionar RLS de profiles y schedule_classes.
- Reforzar la propiedad conjunta user_id + class_id en tasks.
- Rotar definitivamente cualquier llave administrativa antigua.

Prioridad media:

- Permitir eliminar una calificación desde el detalle de la tarea.
- Agregar periodos académicos si se necesita historial por semestre.
- Mostrar una fecha de última actualización de calificaciones.
- Mejorar la reconciliación de notificaciones entre cuentas.

Prioridad baja:

- Integración futura con Google Classroom. No hacerla todavía sin necesidad académica clara, porque requiere OAuth, Google Cloud, permisos, verificación y sincronización.
