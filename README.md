# Ron Carúpano Brand Hub · V.0

Primera migración del manual de marca de Ron Carúpano a un repositorio web navegable.

## Qué contiene esta V.0

- Inicio y estado de la versión.
- Fundamentos actuales de la marca.
- Portafolio interactivo con filtros y fichas de producto.
- Muestra de identidad visual digital.
- Paleta con copia de códigos HEX.
- Principios de voz de marca.
- Experiencias y checklists desplegables.
- Roadmap de contenidos pendientes.
- Buscador básico en el navegador.
- Diseño responsive para escritorio y móvil.

> Esta V.0 es un prototipo de migración. No sustituye todavía el manual oficial aprobado.

## Probarlo en tu Mac

Al usar `fetch()` para cargar el archivo `data/brand.json`, conviene abrir el sitio desde un servidor local y no haciendo doble clic en `index.html`.

```bash
cd ron-carupano-brand-hub-v0
python3 -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

## Publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub, por ejemplo `ron-carupano-brand-hub`.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. Haz commit y push a la rama `main`.
4. En GitHub abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Selecciona la rama `main` y la carpeta `/ (root)`.
7. Pulsa **Save**.
8. GitHub publicará la web en una dirección similar a:

```text
https://TU-USUARIO.github.io/ron-carupano-brand-hub/
```

El archivo `.nojekyll` evita que GitHub intente procesar el proyecto con Jekyll.

## Estructura

```text
ron-carupano-brand-hub-v0/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── brand.json
├── assets/
│   └── images/
│       └── products/
├── README.md
├── LICENSE_NOTES.md
└── .nojekyll
```

## Cómo editar el contenido

Los productos y colores se editan en:

```text
data/brand.json
```

Las secciones generales están en:

```text
index.html
```

El diseño, los tamaños y el responsive están en:

```text
styles.css
```

La interacción —filtros, modal, buscador y copia de colores— está en:

```text
app.js
```

## Prioridades para V.1

1. Auditoría página por página del manual.
2. Incorporación de logos SVG y activos maestros oficiales.
3. Verificación de textos, grados alcohólicos, premios y claims.
4. Nueva plataforma estratégica de marca.
5. Identidad visual ampliada para digital.
6. Guía de social media, influencers y contenidos.
7. Compliance por mercado y consumo responsable.
8. Biblioteca real de descargas.
9. Versionado, responsables y flujo de aprobación.
10. Español e inglés.

## Dominio propio

Cuando el sitio esté aprobado, GitHub Pages permite conectar un dominio o subdominio, por ejemplo:

```text
brand.roncarupano.com
```

La configuración requiere crear el registro DNS correspondiente y añadir el dominio en **Settings → Pages → Custom domain**.
