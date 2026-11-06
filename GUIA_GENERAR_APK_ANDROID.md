# Generar un APK de Campus Mind para Android

## Contexto

La aplicación utiliza Expo y variables de entorno para conectarse a Supabase y a Groq.

Durante el desarrollo local, la aplicación lee las variables desde `.env.local`. Sin embargo, al generar un APK, el teléfono no tiene acceso automático a ese archivo. Las variables deben estar disponibles durante el proceso de compilación para que Expo las incluya en el bundle de la aplicación.

Las variables usadas por la app son:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica
EXPO_PUBLIC_GROQ_API_KEY=tu_clave_de_groq
EXPO_PUBLIC_GROQ_MODEL=llama-3.1-8b-instant
```

## Solución propuesta

Se utilizará **EAS Build**, el servicio de Expo para generar aplicaciones Android. Se configurará un perfil `preview` que produzca un archivo `.apk`, el cual se puede descargar e instalar directamente en un teléfono Android.

## 1. Configurar el perfil de compilación

Crear un archivo `eas.json` en la raíz del proyecto:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "environment": "preview"
    }
  }
}
```

La propiedad `buildType: "apk"` es necesaria porque EAS genera un Android App Bundle (`.aab`) por defecto. Para instalar la aplicación directamente en un dispositivo, se necesita un `.apk`.

## 2. Iniciar sesión en Expo

Desde la carpeta del proyecto:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

El primer comando inicia sesión en una cuenta de Expo. El segundo prepara la configuración necesaria para usar EAS Build.

## 3. Configurar las variables de entorno

Registrar las variables para el ambiente `preview`:

```bash
npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_URL --environment preview --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --environment preview --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_GROQ_API_KEY --environment preview --visibility plaintext
npx eas-cli@latest env:set --name EXPO_PUBLIC_GROQ_MODEL --environment preview --visibility plaintext
```

Cada comando solicitará el valor correspondiente. Estas variables se utilizarán durante la compilación del APK.

También es posible administrarlas desde el panel de Expo.

## 4. Generar el APK

Ejecutar:

```bash
npx eas-cli@latest build --platform android --profile preview
```

EAS compilará la aplicación en la nube. Al finalizar mostrará un enlace para descargar el APK.

## 5. Instalarlo en el celular

1. Descargar el APK desde el enlace proporcionado por EAS.
2. Enviar el archivo al teléfono Android.
3. Abrir el archivo en el teléfono.
4. Permitir la instalación desde esa fuente si Android lo solicita.
5. Instalar y abrir Campus Mind.

## Consideración de seguridad

Las variables con el prefijo `EXPO_PUBLIC_` se incluyen dentro de la aplicación compilada y pueden ser visibles para quien tenga el APK.

La URL de Supabase y la clave `publishable` están diseñadas para usarse en el cliente, siempre que las tablas tengan políticas RLS correctamente configuradas.

La clave privada de Groq no debería exponerse en una aplicación móvil. La solución temporal para una demostración es incluirla en el APK, pero la solución recomendada para producción es:

1. Guardar `GROQ_API_KEY` en una Supabase Edge Function o backend.
2. Hacer que la aplicación móvil llame a esa función.
3. Hacer que la función consulte a Groq usando la clave privada.
4. Evitar que `GROQ_API_KEY` tenga el prefijo `EXPO_PUBLIC_` o llegue al código del dispositivo.

## Protección del archivo local

El archivo `.env.local` no debe subirse al repositorio. Se recomienda agregar estas líneas al `.gitignore`:

```gitignore
.env.local
.env.*.local
```

## Resultado esperado

Con esta configuración, la aplicación se compila con las variables de entorno del ambiente `preview`, se genera un APK instalable y puede mostrarse en un teléfono Android sin depender de Expo Go ni de la computadora de desarrollo.
