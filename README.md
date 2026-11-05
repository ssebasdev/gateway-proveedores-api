# Gateway de proveedores

API REST en Node.js y TypeScript para obtener los recibos del mes actual de
Sedapal y Calidda. El gateway autentica las solicitudes mediante una API key y
devuelve el recibo solicitado como archivo PDF.

## Requisitos

- Node.js 22.6 o superior
- [pnpm](https://pnpm.io/) 12.16.1 o superior
- Una API key para proteger el gateway

## Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd gateway-proveedores
pnpm install
```

Crear un archivo `.env` en la raíz del proyecto:

```env
API_KEY=una-clave-segura
```

> El archivo `.env` está excluido del repositorio. No publiques credenciales
> de proveedores ni API keys en GitHub.

## Ejecución

Iniciar la API:

```bash
pnpm exec tsc --noEmit
node --experimental-strip-types src/app.ts
```

El servidor queda disponible en `http://localhost:3000`.

## Autenticación

Todas las rutas requieren el encabezado:

```http
x-api-key: una-clave-segura
```

Las solicitudes sin una API key válida responden con HTTP `401`.

## Endpoints

### Estado del servicio

```http
GET /
```

Ejemplo:

```bash
curl http://localhost:3000/ \
  -H "x-api-key: una-clave-segura"
```

Respuesta:

```json
{
  "message": "API Recibos",
  "status": 200
}
```

### Recibo de Sedapal

```http
GET /recibo/sedapal/:supplyCode
```

`supplyCode` es el número de suministro de Sedapal. El endpoint consulta el
recibo del mes actual y responde con un PDF.

```bash
curl "http://localhost:3000/recibo/sedapal/1234567" \
  -H "x-api-key: una-clave-segura" \
  --output recibo-sedapal.pdf
```

### Recibo de Calidda

```http
POST /recibo/calidda/:supplyCode
```

El cuerpo debe incluir el número y tipo de documento del titular:

```json
{
  "documentNumber": "12345678",
  "documentType": "PE1"
}
```

`documentType` acepta `PE1` o `PE2`.

Ejemplo:

```bash
curl -X POST "http://localhost:3000/recibo/calidda/1234567" \
  -H "x-api-key: una-clave-segura" \
  -H "Content-Type: application/json" \
  -d '{"documentNumber":"12345678","documentType":"PE1"}' \
  --output recibo-calidda.pdf
```

## Respuestas de error

| Código | Descripción |
| --- | --- |
| `401` | API key ausente o inválida, o no se pudo autenticar con Sedapal |
| `404` | No se encontró o no se pudo descargar el recibo |
| `200` | El recibo se devuelve como `application/pdf` |

## Estructura del proyecto

```text
src/
├── app.ts                 # Servidor Express y rutas HTTP
├── calidda.service.ts     # Integración con Calidda
└── sedapal.service.ts     # Integración con Sedapal
```

## Desarrollo

Validar los tipos antes de ejecutar cambios:

```bash
pnpm exec tsc --noEmit
```

El proyecto utiliza `dotenv` para cargar variables desde `.env`, Express 5
para exponer la API y las APIs nativas `fetch` y `Buffer` de Node.js para
consultar proveedores y convertir los recibos a PDF.

## Nota sobre las integraciones

Los endpoints de Sedapal y Calidda utilizados por este proyecto fueron
identificados mediante ingeniería inversa de sus aplicaciones y sitios web
existentes. Actualmente no se dispone de endpoints oficiales publicados para
desarrolladores por parte de estos proveedores.

Por este motivo, las rutas y respuestas externas pueden cambiar sin previo
aviso, lo que podría requerir actualizar las integraciones. Antes de usar este
proyecto en producción, verifica que su uso cumpla con los términos y
condiciones de cada proveedor y obtén las autorizaciones correspondientes.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo
[LICENSE](./LICENSE) para más información.

La licencia únicamente aplica al código de este repositorio y no concede
derechos sobre las marcas, APIs, endpoints, datos o servicios de terceros.