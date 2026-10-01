# LM Construction · Luis Molina

Landing comercial en **HTML, CSS y JavaScript puro**, sin compilación, dependencias de producción ni backend. Las fotos y las fuentes se sirven desde el propio sitio.

## Ver la página

Abrí `index.html` en tu navegador. También podés usar Live Server de VS Code o ejecutar `python -m http.server 4173` desde esta carpeta y abrir `http://localhost:4173`.

## Publicar en GitHub Pages

1. Creá el repositorio y subí `index.html`, `styles.css`, `script.js`, `favicon.svg`, `.nojekyll` y la carpeta completa `assets/`. Podés incluir este README y `.gitignore`.
2. En el repositorio, abrí **Settings → Pages**.
3. En **Build and deployment → Source**, elegí **Deploy from a branch**.
4. Seleccioná la rama `main`, la carpeta **/(root)** y **Save**.
5. GitHub mostrará la dirección del sitio cuando termine de publicarse.

Las rutas son relativas: funcionan tanto en `usuario.github.io/repositorio/` como en un dominio propio. No hace falta ejecutar npm ni instalar paquetes.

Referencia: [configurar GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Conectar el dominio más adelante

Configurá el dominio en **Settings → Pages → Custom domain** y los registros DNS en el proveedor del dominio, según la [documentación de GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). Cuando conozcas la URL definitiva, actualizá `og:image` de `index.html` con una URL absoluta, y agregá las etiquetas `og:url` y `canonical` correspondientes. No se configuró un dominio ficticio ni un CNAME provisional.

## Archivos y cambios frecuentes

- `index.html`: contenido, enlaces, logo integrado, servicios y formulario.
- `styles.css`: identidad visual, diseño responsive y animaciones. Los colores están en `:root`.
- `script.js`: menú, galerías, etapas de obra, validación y enlace a WhatsApp.
- `assets/images/`: fotos optimizadas en WebP; conservan el contenido de los originales.
- `assets/fonts/`: Manrope y DM Sans locales con sus licencias.
- `assets/brand/lm-construction.svg`: logo completo oscuro; la L forma la base de la M, con un remate biselado en cobre y Construction debajo.
- `assets/brand/lm-construction-claro.svg`: el mismo logo en tono claro para fondos oscuros.
- `assets/brand/lm-monograma.svg`: iniciales LM para usos pequeños. Todos los logos están trazados en SVG, sin depender de fuentes externas.
- `favicon.svg`: icono de la pestaña.

Para cambiar el número de contacto, reemplazá `5491130189621` en `index.html` y `script.js`, y el número visible en la sección de contacto. Para sumar fotos, agregalas a `assets/images/` y a `galleryData` dentro de `script.js`. Actualizá también los contadores y las etiquetas del HTML si cambia la cantidad de fotos.

## Consultas por WhatsApp

El formulario valida nombre, celular y consulta, y prepara un mensaje a **+54 9 11 3018-9621**. El servicio es opcional. Al continuar, se abre WhatsApp y el visitante confirma el envío allí. La página nunca afirma que el mensaje ya fue enviado.

Si el navegador bloquea la nueva pestaña, queda disponible un enlace para abrir la misma consulta. Los campos se conservan para poder corregirlos. No hay base de datos, almacenamiento local de consultas ni envío por correo.

## Comportamiento y accesibilidad

Al abrir el inicio aparece una presentación con una foto de obra, la marca LM Construction y Luis Molina. Un clic o toque abre la imagen en dos paneles; también funciona con el botón, el teclado y Escape. La entrada vuelve a aparecer al recargar el inicio. Los enlaces directos a secciones (por ejemplo `#contacto`) van directamente al contenido. Sin JavaScript, la página queda disponible sin presentación.

Galerías con flechas, puntos, teclado, gestos táctiles y cierre con Escape. Formulario con errores asociados a cada campo. Navegación móvil y enlace para saltar al contenido. Las animaciones respetan la preferencia de movimiento reducido; también se pueden pausar desde la franja de servicios.

La firma `2026 SG Desarrollo web -Alejandro Banegas-` aparece debajo del copyright de LM Construction, dentro de `.footer-credits` en `index.html`.

`assets Foto/` contiene el material original entregado; no hace falta subirlo para que la página funcione. `.qa/` guarda herramientas y resultados locales de verificación, está excluida de Git y no forma parte del sitio.
