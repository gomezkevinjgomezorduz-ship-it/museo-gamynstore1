# GAMYN — Virtual Museum · Guía paso a paso

Museo virtual 3D hecho con **A-Frame**. Funciona en navegador (computador y celular) sin instalar ninguna app.

---

## 1. Estructura de carpetas

```text
GAMYN-MUSEUM/
│
├── index.html        ← la escena 3D: sala, luces, estantes, pedestales, carteles
├── style.css         ← diseño de la bienvenida, joystick y ficha de prenda
├── script.js         ← componentes + CATÁLOGO DE PRODUCTOS (aquí agregas prendas)
├── README.md         ← esta guía
│
├── modelos/          ← aquí van tus .glb (camisa1.glb, camisa2.glb, ...)
├── texturas/         ← fotos, pósters, imágenes (foto1.jpg, ...)
└── assets/           ← música (ambiente.mp3), aframe.min.js si lo quieres local
```

---

## 2. Paso a paso para empezar

**PASO 1.** Crea una carpeta llamada `GAMYN-MUSEUM` (por ejemplo en el Escritorio).

**PASO 2.** Abre Visual Studio Code → *File → Open Folder…* → elige `GAMYN-MUSEUM`.

**PASO 3.** Crea los archivos `index.html`, `style.css` y `script.js` (botón "New File" en el panel izquierdo) y pega el contenido de cada uno. Si descargaste el ZIP, solo descomprímelo y abre esa carpeta.

**PASO 4.** Crea las carpetas `modelos`, `texturas` y `assets` (botón "New Folder").

**PASO 5.** Instala la extensión **Live Server**:
- En VS Code abre Extensiones (`Ctrl+Shift+X`).
- Busca **Live Server** (autor: Ritwick Dey) → *Install*.
- Sirve para abrir tu proyecto en un mini servidor local. **Es obligatorio**: si abres `index.html` con doble clic (`file://`) el navegador bloquea la carga de los `.glb`.

**PASO 6.** Clic derecho sobre `index.html` → **Open with Live Server**. Se abre `http://127.0.0.1:5500`.

**PASO 7.** Pulsa **ENTRAR AL MUSEO**.
- Teclado: `W A S D` o flechas para caminar, `Q` / `E` para girar.
- Mouse: arrastra para mirar, clic en una prenda para ver su ficha.

Mientras no tengas los `.glb`, el museo muestra camisetas, gorras y cubos **de muestra** en cada lugar. Cuando agregues el archivo real, lo reemplaza solo.

---

## 3. Probarlo en tu celular

### Opción A — Misma red Wi-Fi (la más rápida)
1. Celular y computador en la **misma red Wi-Fi**.
2. Averigua la IP de tu computador:
   - Windows: abre `cmd` y escribe `ipconfig` → "Dirección IPv4" (ej. `192.168.1.25`).
   - Mac: `ifconfig | grep inet` o Ajustes → Wi-Fi → Detalles.
3. Con Live Server encendido, en el navegador del celular abre: `http://192.168.1.25:5500` (usa tu IP).
4. Si no abre, permite Node/VS Code en el firewall de Windows.

### Opción B — Enlace público con HTTPS (para mostrarlo a otras personas)
1. En VS Code abre el panel **Ports** (junto a la Terminal).
2. *Forward a Port* → `5500` → clic derecho → *Port Visibility → Public*.
3. Copia el enlace `https://...` y ábrelo en el celular (pide iniciar sesión con GitHub/Microsoft la primera vez).

### Opción C — Publicarlo gratis
Arrastra la carpeta completa a **https://app.netlify.com/drop** (o usa GitHub Pages / Vercel). Te da un enlace `https://` que cualquiera puede abrir.

**Controles en celular:** arrastra con un dedo sobre la escena para mirar · joystick (izquierda) para caminar · botones ⟲ ⟳ para girar · toca una prenda (o el botón "Ver prenda" que aparece al acercarte) para ver su ficha.

---

## 4. Cómo agregar tus modelos 3D (.glb)

### 4.1 Prepara el archivo
- Formato: **.glb** (un solo archivo, recomendado) o .gltf.
- Nombres sin espacios, sin tildes y en minúscula: `camisa1.glb`, `camisa2.glb`, `gorra1.glb`.
- **Para celular:** idealmente cada modelo pesa **menos de 3 MB** y tiene **menos de 30.000 triángulos**, con texturas de **1024×1024** (máx. 2048). Puedes comprimir en https://gltf.report o con `gltf-transform optimize`.
- Ideal: que el punto de origen del modelo esté en el **centro de la base** (pies de la prenda). Si no, lo corriges con `offset`.

### 4.2 Guárdalo
Copia el archivo dentro de la carpeta **`modelos/`**:

```text
modelos/
├── camisa1.glb
├── camisa2.glb
└── camisa3.glb
```

### 4.3 Ya está conectado
En `script.js` (sección `PRODUCTS`) ya existen productos que apuntan a `modelos/camisa1.glb`, `camisa2.glb`, etc. Solo guarda tu archivo con ese nombre y recarga la página.

### 4.4 Agregar una camisa nueva
1. Guarda `modelos/camisa7.glb`.
2. En `script.js`, dentro de `PRODUCTS`, copia un bloque existente (o la plantilla comentada al final) y cambia:

```js
{
  id: 'camisa7',                       // nombre único
  model: 'modelos/camisa7.glb',        // ruta del archivo
  parent: '#estante-izq-2', slot: 0,   // en qué estante y qué espacio (0, 1 o 2)
  offset: '0 0 0', rotation: '0 0 0', scale: '1 1 1',
  placeholder: 'shirt', color: '#f5f5f5',
  info: {
    collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº7',
    description: '...', material: '...', price: '...', concept: '...'
  }
}
```
(No olvides la coma entre bloques.)

### 4.5 Reemplazar un modelo por otro
Opción 1: sobrescribe `modelos/camisa1.glb` con el nuevo archivo (mismo nombre).
Opción 2: cambia `model: 'modelos/camisa1.glb'` por `model: 'modelos/camisa1_v2.glb'`.
Tip: si el navegador muestra el modelo viejo, recarga con `Ctrl+F5`.

---

## 5. Ajustar posición, rotación y tamaño

Todo se hace en el bloque del producto dentro de `script.js`:

| Propiedad | Qué hace | Ejemplo |
|---|---|---|
| `offset` | Mueve el modelo respecto a su espacio. `x` = izq/der, `y` = arriba/abajo, `z` = adelante/atrás (en metros) | `'0 0.05 0.1'` lo sube 5 cm y lo acerca 10 cm |
| `rotation` | Gira en grados. Normalmente solo cambias la **Y** | `'0 180 0'` lo da vuelta, `'0 30 0'` lo gira un poco |
| `scale` | Tamaño. `1` = original. Si el modelo sale gigante o diminuto, cambia este valor | `'0.01 0.01 0.01'` (modelo en cm), `'2 2 2'` el doble |
| `spin` | `true` = gira lentamente | `spin: true` |

**Método de ajuste rápido:** cambia un valor → guarda → Live Server recarga solo → mira → repite.
Problemas típicos:
- *No veo la prenda* → probablemente está enorme o minúscula: prueba `scale: '0.01 0.01 0.01'` y luego `'100 100 100'`.
- *Está enterrada en el estante* → sube `offset` en Y (`'0 0.3 0'`).
- *Se ve de espaldas* → `rotation: '0 180 0'`.
- *Flota* → baja `offset` en Y (valores negativos).

---

## 6. Iluminación

Todo está en `index.html` (luces generales) y en `script.js` (focos de estantes y pedestales).

- **Ambiental / hemisférica** → luz suave general. Para que el museo sea más claro, sube `intensity`.
- **Puntuales** (`type: point`) → luces del techo. Cambia `position` para moverlas.
- **Direccional** → luz tipo "sol" suave (solo en computador).
- **Focos de estante** (`spotIntensity` del componente `gamyn-shelf`) → apuntan a cada prenda. Súbelo o bájalo: `gamyn-shelf="slots: 3; spacing: 2; spotIntensity: 14"`.
- **Foco del pedestal central** → `gamyn-pedestal="... spotIntensity: 16"`.

> Si al abrirlo ves **todo muy oscuro o quemado (blanco)**, es solo cuestión de subir/bajar estos números `intensity`. Pasa porque cada versión de A-Frame calcula la luz distinta.

**Luz extra sobre un modelo concreto** (cópiala dentro de `<a-scene>` en `index.html`):

```html
<a-entity light="type: spot; color: #ffffff; intensity: 15; angle: 25; penumbra: 0.6; castShadow: false"
          position="-11 3 5" rotation="-90 0 0"></a-entity>
```

---

## 7. Rendimiento en celular (ya aplicado + consejos)

Ya incluido: menos luces en celular, un foco por estante, resolución limitada a 1.5×, piso con una sola textura repetida, sin sombras, decoraciones con materiales `flat`.

Consejos: modelos livianos (<3 MB), texturas ≤1024 px, evita más de ~20 luces dinámicas, no pongas decenas de modelos pesados a la vista a la vez.

---

## 8. Cómo crecer (escalabilidad)

- **Más estantes:** copia una línea `<a-entity gamyn-shelf ...>` en `index.html`, cambia `id` y `position`, y usa ese `id` en `parent`.
- **Más pedestales:** igual con `gamyn-pedestal`. Para que no se puedan atravesar, agrega su posición en `CONFIG.obstacles` (`script.js`).
- **Pantalones, zapatos, gorras, accesorios:** son productos más en `PRODUCTS` (`placeholder: 'cap'` o `'generic'` para la muestra).
- **Fotografías y carteles:** `<a-entity gamyn-poster="title: ...; src: texturas/foto1.jpg; w: 1.6; h: 2.2" position="x y z">`.
- **Carteles de zona:** `<a-entity gamyn-sign="text: COLLECTION 02; width: 4" position="0 3.9 -20">`.
- **Música ambiental:** guarda `assets/ambiente.mp3` y en `script.js` pon `audioSrc: 'assets/ambiente.mp3'`. Suena al pulsar "Entrar".
- **Nuevas salas / colecciones:** amplía la sala cambiando medidas de paredes/piso (y `CONFIG.bounds`), o crea otra con paredes adicionales y un nuevo grupo de estantes con otro `collection` en la ficha.
- **Animaciones:** `spin: true` o el componente `animation` de A-Frame.
- **Info de la marca:** pósters/carteles con texto, o una "prenda" tipo `generic` cuya ficha cuente la historia.

---

## 9. Realidad virtual (WebXR)

Si tu navegador/visor soporta WebXR (p. ej. Meta Quest Browser), aparece el botón de gafas de A-Frame abajo a la derecha. Dentro: la palanca izquierda camina, el láser del control derecho apunta a una prenda y el gatillo abre su ficha. En esta primera versión la VR es básica.

> Nota: WebXR y algunos sensores requieren **HTTPS** (usa la Opción B o C de la sección 3).

---

## 10. Solución de problemas

| Problema | Solución |
|---|---|
| Se queda en "Cargando…" | Revisa tu internet (A-Frame se descarga de aframe.io) o descarga `aframe.min.js` a `assets/` y cambia la ruta en `index.html`. |
| Pantalla negra | Abre la consola del navegador (`F12`) y revisa el error rojo. |
| El modelo no aparece, solo la forma de muestra | El archivo no está en `modelos/` o el nombre no coincide exactamente (mayúsculas incluidas). |
| En el celular no abre | Misma red Wi-Fi, IP correcta, firewall permitido; o usa Ports/Netlify. |
| Va lento en el celular | Reduce el peso de los `.glb` y texturas (sección 4.1). |
