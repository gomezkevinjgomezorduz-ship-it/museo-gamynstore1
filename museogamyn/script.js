/* =====================================================================
   GAMYN — Virtual Museum · script.js
   ---------------------------------------------------------------------
   1. CONFIG ........ ajustes generales (límites, música, distancias)
   2. PRODUCTS ...... EL CATÁLOGO: aquí agregas/cambias prendas
   3. Componentes ... piso, estantes, pedestales, carteles, pósters,
                      catálogo (crea los productos) y movimiento
   4. Interfaz ...... bienvenida, joystick, ficha de prenda
   ===================================================================== */

(function () {
  'use strict';

  const THREE = AFRAME.THREE;
  const IS_MOBILE = AFRAME.utils.device.isMobile();

  /* ------------------------------------------------------------------
     1. CONFIGURACIÓN
     ------------------------------------------------------------------ */
  const CONFIG = {
    audioSrc: 'assets/audiogamyn.mpeg',                  // Música ambiental opcional. Ej: 'assets/ambiente.mp3'
    bounds: { minX: -10.8, maxX: 10.8, minZ: -15, maxZ: 15 },   // hasta dónde se puede caminar
    // Zonas donde NO se puede entrar (círculos: x, z, radio). Evita atravesar los pedestales.
    obstacles: [
      { x: 0,  z: 0,   r: 2.5 },   // plataforma central
      { x: -4, z: -12, r: 0.9 },   // pedestal 1
      { x: 0,  z: -12, r: 0.9 },   // pedestal 2
      { x: 4,  z: -12, r: 0.9 },   // pedestal 3
      { x: 0, z: -6, r: 1.4 },   // moto
    ],
    nearDistance: 2.8              // a cuántos metros aparece el botón "Ver prenda"
  };

  // Estado global compartido entre el movimiento y la interfaz
  const STATE = { entered: false, input: { x: 0, y: 0, turn: 0, vrx: 0, vry: 0 } };
  window.GAMYN = { STATE: STATE, CONFIG: CONFIG };

  /* ------------------------------------------------------------------
     2. CATÁLOGO DE PRODUCTOS
     ------------------------------------------------------------------
     Cada producto es un bloque { ... }. Para agregar uno nuevo:
       1) copia un bloque,
       2) cambia id, model, parent y slot,
       3) ajusta offset / rotation / scale hasta que se vea bien.

     parent   → id del estante o pedestal donde va (ver index.html)
     slot     → número de espacio dentro del estante (0, 1, 2...)
     offset   → ajuste fino "x y z" en metros respecto al slot
     rotation → giro "x y z" en grados (normalmente solo cambia la Y)
     scale    → tamaño "x y z". 1 = tamaño original del modelo
     spin     → true = el modelo gira lentamente
     placeholder → forma de muestra mientras no exista el .glb: 'shirt' | 'cap' | 'generic'
     color    → color de la forma de muestra
     hit      → tamaño del área donde se puede tocar { w, h, d, y }
     info     → datos de la ficha
     ------------------------------------------------------------------ */
  const PRODUCTS = [
    // ---------- Estante izquierdo 1 ----------
  
    {
      id: 'camisa1', model: 'modelos/camisaangel.glb',
      parent: '#estante-izq-1', slot: 0,
      offset: '0 0.5 0', rotation: '0 260 0', scale: '1 1 1',
      placeholder: 'shirt', color: '#f5f5f5',
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº1 — Urban Form',
        description: 'Corte oversize con caída limpia y costuras reforzadas. Pensada para la calle.',
        material: 'Algodón pesado 240 g', price: '$ 120.000 COP',
        concept: 'La forma urbana: silueta amplia, líneas simples.'
      }
    },
    {
      id: 'camisa2', model: 'modelos/busorojo/model.glb',
      parent: '#estante-izq-1', slot: 1,
      offset: '0 0.7 0', rotation: '0 0 0', scale: '0.8 0.8 0.8',
      placeholder: 'shirt', color: '#111111',
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº2 — Night Shift',
        description: 'Negro profundo con logo discreto bordado en el pecho.',
        material: 'Algodón peinado', price: '$ 115.000 COP',
        concept: 'Moverse de noche: minimalismo en negro.'
      }
    },
    {
      id: 'camisa3', model: 'modelos/busoazul.glb',
      parent: '#estante-izq-1', slot: 2,
      offset: '0 0.7 0', rotation: '0 260 0', scale: '1.5 1.5 1.5',
      placeholder: 'shirt', color: '#d9d9de',
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº3 — Concrete',
        description: 'Tono gris cemento, tacto suave y ajuste relajado.',
        material: 'Algodón lavado', price: '$ 118.000 COP',
        concept: 'Concreto y ciudad: texturas grises.'
      }
    },

    // ---------- Estante derecho 1 ----------
    {
      id: 'camisa4', model: 'modelos/buso2.glb',
      parent: '#estante-der-1', slot: 0,
      offset: '0 0.5 0', rotation: '0 260 0', scale: '1 1 1',
      placeholder: 'shirt', color: '#111111',
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº4 — Signal',
        description: 'Gráfico frontal de alto contraste.',
        material: 'Algodón 220 g', price: '$ 125.000 COP',
        concept: 'Señales de la ciudad convertidas en estampado.'
      }
    },
    {
      id: 'camisa5', model: 'modelos/buso1.glb',
      parent: '#estante-der-1', slot: 1,
      offset: '0 0.5 0', rotation: '0 260 0', scale: '1 1 1',
      placeholder: 'shirt', color: '#f5f5f5',
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº5 — Blank Canvas',
        description: 'Blanco total: un lienzo para combinar con todo.',
        material: 'Algodón orgánico', price: '$ 110.000 COP',
        concept: 'El básico perfecto.'
      }
    },
    {
      id: 'camisa6', model: 'modelos/camisa2/model.glb',
      parent: '#estante-der-1', slot: 2,
      offset: '0 0.5 0', rotation: '0 0 0', scale: '0.7 0.7 0.7',
      placeholder: 'shirt', color: '#2a2a30',
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº6 — Midnight',
        description: 'Gris grafito con acabado ligeramente brillante.',
        material: 'Mezcla algodón-poliéster', price: '$ 130.000 COP',
        concept: 'Luces de ciudad reflejadas en tela.'
      }
    },

    // ---------- Pieza principal (centro del museo) ----------
    {
      id: 'principal.glb', model: 'modelos/principal.glb/model.glb',
      parent: '#ped-centro', slot: 0,
      offset: '0 1.5 0', rotation: '0 0 0', scale: '1.6 1.6 1.6', spin: true,
      placeholder: 'shirt', color: '#f5f5f5',
      hit: { w: 1.6, h: 1.7, d: 1.2, y: 0.85 },
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Pieza Insignia',
        description: 'La prenda que resume la colección. Gira para que la veas desde todos los ángulos.',
        material: 'Algodón pesado + bordado 3D', price: '$ 180.000 COP',
        concept: 'Una sola prenda que cuenta toda la historia de GAMYN.'
      }
    },

    // ---------- Sala Manifiesto: accesorios ----------
    {
      id: 'gorra1', model: 'modelos/gorro.glb',
      parent: '#ped-1', slot: 0,
      offset: '0 0.5 0', rotation: '0 -70 0', scale: '1 1 1',
      placeholder: 'cap', color: '#111111',
      info: {
        collection: 'GAMYN — ACCESORIOS', name: 'Gorra Signal',
        description: 'Gorra de 6 paneles con cierre ajustable.',
        material: 'Sarga de algodón', price: '$ 70.000 COP',
        concept: 'El detalle final del outfit.'
      }
    },
    {
      id: 'zapatos1', model: 'modelos/zapatos1/model.glb',
      parent: '#ped-2', slot: 0,
      offset: '0 0.3 0', rotation: '0 430 0', scale: '0.3 0.3 0.3',
      placeholder: 'generic', color: '#f5f5f5',
      info: {
        collection: 'GAMYN — PRÓXIMAMENTE', name: 'Zapatillas (prototipo)',
        description: 'Primer prototipo de calzado de la marca.',
        material: 'Por definir', price: 'Próximamente',
        concept: 'GAMYN de pies a cabeza.'
      }
    },
    {
      id: 'accesorio1', model: 'modelos/mano.glb',
      parent: '#ped-3', slot: 0,
      offset: '0 0.3 0', rotation: '0 250 0', scale: '1 1 1',
      placeholder: 'generic', color: '#111111',
      info: {
        collection: 'GAMYN — ACCESORIOS', name: 'Accesorio Nº1',
        description: 'Espacio reservado para un nuevo accesorio de la marca.',
        material: 'Por definir', price: 'Próximamente',
        concept: 'Detalles que completan la colección.'
      }
    }

    /* ---- PLANTILLA PARA UN PRODUCTO NUEVO (copia, quita los comentarios y cambia los datos) ----
    ,{
      id: 'camisa7', model: 'modelos/camisa7.glb',
      parent: '#estante-izq-2', slot: 0,
      offset: '0 0 0', rotation: '0 0 0', scale: '1 1 1',
      placeholder: 'shirt', color: '#f5f5f5',
      info: {
        collection: 'GAMYN — COLLECTION 01', name: 'Camisa Nº7',
        description: '...', material: '...', price: '...', concept: '...'
      }
    }
    --------------------------------------------------------------------------------------------- */
  ];
  window.GAMYN.PRODUCTS = PRODUCTS;

  /* ------------------------------------------------------------------
     Utilidades pequeñas
     ------------------------------------------------------------------ */
  // Crea un elemento A-Frame, le pone atributos y lo mete dentro de "parent"
  function mk(tag, attrs, parent) {
    const e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  // Ejecuta fn cuando la entidad ya está lista
  function whenLoaded(el, fn) {
    if (el.hasLoaded) fn(); else el.addEventListener('loaded', fn, { once: true });
  }
  // Agrega una luz tipo "foco" (spot) real de THREE a una entidad
  function addSpot(el, pos, target, intensity, angle, distance) {
    const spot = new THREE.SpotLight(0xfff1dd, intensity, distance || 8, angle, 0.6, 2);
    spot.position.set(pos[0], pos[1], pos[2]);
    spot.target.position.set(target[0], target[1], target[2]);
    el.object3D.add(spot);
    el.object3D.add(spot.target);
    return spot;
  }

  /* ------------------------------------------------------------------
     3a. PISO DE AJEDREZ (textura generada por código)
         Dibujamos 2×2 casillas en un canvas y la textura se repite.
     ------------------------------------------------------------------ */
  AFRAME.registerComponent('checker-floor', {
    schema: {
      width: { default: 24 }, depth: { default: 32 }, tile: { default: 1 },
      light: { default: '#f4f4f4' }, dark: { default: '#0a0a0a' }
    },
    init: function () {
      const d = this.data;
      const c = document.createElement('canvas');
      c.width = c.height = 256;
      const g = c.getContext('2d');
      g.fillStyle = d.light; g.fillRect(0, 0, 256, 256);
      g.fillStyle = d.dark;
      g.fillRect(128, 0, 128, 128);     // arriba-derecha negra
      g.fillRect(0, 128, 128, 128);     // abajo-izquierda negra

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(d.width / (2 * d.tile), d.depth / (2 * d.tile));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = IS_MOBILE ? 4 : 8;

      const geo = new THREE.PlaneGeometry(d.width, d.depth);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25, metalness: 0.05 });
      this.el.setObject3D('mesh', new THREE.Mesh(geo, mat));
    },
    remove: function () { this.el.removeObject3D('mesh'); }
  });

  /* ------------------------------------------------------------------
     3b. ESTANTE (mostrador con luz propia)
         <a-entity gamyn-shelf="slots: 3; spacing: 2">
         Guarda las posiciones de sus espacios en el.gamynSlots
     ------------------------------------------------------------------ */
  AFRAME.registerComponent('gamyn-shelf', {
    schema: {
      slots: { type: 'int', default: 3 },
      spacing: { default: 2 },
      spotIntensity: { default: 5 }
    },
    init: function () {
      const d = this.data, el = this.el;
      const w = d.slots * d.spacing;
      const topY = 1.15;                         // altura donde se apoyan las prendas
      const m = function (c, r, me) { return { color: c, roughness: r, metalness: me }; };
      el.gamynSlots = [];

      // Panel trasero, base, tapa blanca, techo del estante y tira de luz
      mk('a-box', { position: '0 1.6 -0.28', width: w, height: 3.2, depth: 0.06, material: m('#0c0c0c', 0.7, 0.2) }, el);
      mk('a-box', { position: '0 0.55 0', width: w, height: 1.1, depth: 0.5, material: m('#141414', 0.5, 0.4) }, el);
      mk('a-box', { position: '0 ' + (topY - 0.025) + ' 0.01', width: w + 0.04, height: 0.05, depth: 0.56, material: m('#f2f2f2', 0.2, 0.1) }, el);
      mk('a-box', { position: '0 3.2 0.35', width: w, height: 0.1, depth: 1.3, material: m('#0c0c0c', 0.6, 0.3) }, el);
      mk('a-box', { position: '0 3.14 0.9', width: w * 0.9, height: 0.02, depth: 0.04, material: { shader: 'flat', color: '#ffffff' } }, el);
      // Barra para colgar prendas (decorativa)
      mk('a-cylinder', { position: '0 2.5 0.12', rotation: '0 0 90', radius: 0.012, height: w, material: m('#bbbbbb', 0.3, 0.9) }, el);

      for (let i = 0; i < d.slots; i++) {
        const x = (i - (d.slots - 1) / 2) * d.spacing;
        // Plato negro brillante donde se apoya cada prenda
        mk('a-cylinder', { position: x + ' ' + (topY + 0.006) + ' 0.02', radius: 0.32, height: 0.012, material: m('#050505', 0.2, 0.6) }, el);
        el.gamynSlots.push(new THREE.Vector3(x, topY + 0.012, 0.02));

        if (!IS_MOBILE) {
          // Computador: un foco por cada prenda, apuntando a ella
          addSpot(el, [x, 3.1, 0.55], [x, 1.5, 0], d.spotIntensity, 0.45, 7);
          mk('a-cylinder', { position: x + ' 3.14 0.55', radius: 0.04, height: 0.03, material: { shader: 'flat', color: '#fff6e0' } }, el);
        }
      }
      if (IS_MOBILE) {
        // Celular: un solo foco ancho por estante (menos luces = más fluidez)
        addSpot(el, [0, 3.1, 1.6], [0, 1.3, 0], d.spotIntensity * 2.8, 1.0, 9);
      }
    }
  });

  /* ------------------------------------------------------------------
     3c. PEDESTAL (columna redonda con foco, opcional plataforma)
     ------------------------------------------------------------------ */
  AFRAME.registerComponent('gamyn-pedestal', {
    schema: {
      height: { default: 1 }, radius: { default: 0.5 },
      platform: { default: 0 },           // radio de plataforma negra (0 = sin plataforma)
      spot: { default: true },
      priority: { default: false },       // true = mantiene su foco también en celular
      spotIntensity: { default: 14 }
    },
    init: function () {
      const d = this.data, el = this.el, h = d.height, r = d.radius;
      el.gamynSlots = [new THREE.Vector3(0, h, 0)];

      if (d.platform > 0) {
        mk('a-cylinder', { position: '0 0.05 0', radius: d.platform, height: 0.1, material: { color: '#050505', roughness: 0.2, metalness: 0.6 } }, el);
        mk('a-ring', { position: '0 0.102 0', rotation: '-90 0 0', 'radius-inner': d.platform - 0.2, 'radius-outer': d.platform - 0.15, material: { shader: 'flat', color: '#ffffff', side: 'double' } }, el);
      }
      mk('a-cylinder', { position: '0 ' + (h / 2) + ' 0', radius: r, height: h, material: { color: '#f2f2f2', roughness: 0.3, metalness: 0.1 } }, el);
      mk('a-cylinder', { position: '0 ' + (h - 0.02) + ' 0', radius: r + 0.04, height: 0.04, material: { color: '#050505', roughness: 0.2, metalness: 0.5 } }, el);

      if (d.spot && (!IS_MOBILE || d.priority)) {
        addSpot(el, [0, h + 2.2, 1.0], [0, h + 0.4, 0], d.spotIntensity, 0.5, 7);
      }
    }
  });

  /* ------------------------------------------------------------------
     3d. CARTEL COLGANTE:  gamyn-sign="text: COLLECTION 01; width: 4"
     ------------------------------------------------------------------ */
  AFRAME.registerComponent('gamyn-sign', {
    schema: { text: { default: 'GAMYN' }, width: { default: 4 } },
    init: function () {
      const d = this.data, el = this.el;
      mk('a-plane', { width: d.width, height: 0.7, material: { color: '#050505', roughness: 0.4, side: 'double' } }, el);
      mk('a-box', { position: '0 -0.35 0.01', width: d.width, height: 0.02, depth: 0.01, material: { shader: 'flat', color: '#ffffff' } }, el);
      mk('a-text', { value: d.text, align: 'center', color: '#ffffff', width: d.width * 1.6, position: '0 0 0.01' }, el);
      mk('a-text', { value: d.text, align: 'center', color: '#ffffff', width: d.width * 1.6, position: '0 0 -0.01', rotation: '0 180 0' }, el);
      [-1, 1].forEach(function (s) {
        mk('a-cylinder', { position: (s * (d.width / 2 - 0.2)) + ' 0.725 0', radius: 0.008, height: 0.75, material: { color: '#888888' } }, el);
      });
    }
  });

  /* ------------------------------------------------------------------
     3e. PÓSTER / FOTO ENMARCADA
         gamyn-poster="title: ...; subtitle: ...; w: 1.8; h: 2.4; src: texturas/foto.jpg"
         Si no pones src, muestra solo el texto.
     ------------------------------------------------------------------ */
  AFRAME.registerComponent('gamyn-poster', {
    schema: {
      title: { default: '' }, subtitle: { default: '' },
      w: { default: 1.6 }, h: { default: 2.2 }, src: { default: '' }
    },
    init: function () {
      const d = this.data, el = this.el;
      mk('a-box', { width: d.w + 0.1, height: d.h + 0.1, depth: 0.04, material: { color: '#000000', roughness: 0.5 } }, el);
      const face = { shader: 'flat', color: d.src ? '#ffffff' : '#161618' };
      if (d.src) face.src = d.src;
      mk('a-plane', { width: d.w, height: d.h, position: '0 0 0.022', material: face }, el);
      if (!d.src) {
        mk('a-text', { value: d.title, align: 'center', color: '#ffffff', width: d.w * 2.4, position: '0 0.15 0.03' }, el);
        mk('a-text', { value: d.subtitle, align: 'center', color: '#9a9aa2', width: d.w * 1.8, position: '0 -0.15 0.03' }, el);
        mk('a-box', { width: d.w * 0.5, height: 0.012, depth: 0.005, position: '0 0 0.03', material: { shader: 'flat', color: '#ffffff' } }, el);
      }
    }
  });

  /* ------------------------------------------------------------------
     3f. CATÁLOGO: lee PRODUCTS y crea cada producto en su lugar.
         - Intenta cargar el .glb. Si no existe, muestra una forma de muestra.
         - Cada producto tiene un área invisible para tocarlo.
         - Detecta qué prenda está cerca y muestra el botón "Ver prenda".
     ------------------------------------------------------------------ */
  function buildPlaceholder(kind, color) {
    const g = document.createElement('a-entity');
    const dark = new THREE.Color(color).getHSL({}).l < 0.5;
    const logoColor = dark ? '#ffffff' : '#111111';
    const mat = { color: color, roughness: 0.85, metalness: 0 };
    if (kind === 'cap') {
      mk('a-cylinder', { position: '0 0.11 0', radius: 0.15, height: 0.13, material: mat }, g);
      mk('a-sphere', { position: '0 0.17 0', radius: 0.15, 'theta-length': 90, material: mat }, g);
      mk('a-box', { position: '0 0.06 0.19', width: 0.24, height: 0.012, depth: 0.15, material: mat }, g);
    } else if (kind === 'generic') {
      mk('a-box', { position: '0 0.16 0', width: 0.32, height: 0.32, depth: 0.32, material: mat }, g);
      mk('a-text', { value: 'GAMYN', align: 'center', color: logoColor, width: 0.9, position: '0 0.16 0.165' }, g);
    } else {
      // Camiseta hecha con cajas
      mk('a-box', { position: '0 0.4 0', width: 0.5, height: 0.62, depth: 0.12, material: mat }, g);
      mk('a-box', { position: '-0.33 0.62 0', rotation: '0 0 35', width: 0.24, height: 0.17, depth: 0.12, material: mat }, g);
      mk('a-box', { position: '0.33 0.62 0', rotation: '0 0 -35', width: 0.24, height: 0.17, depth: 0.12, material: mat }, g);
      mk('a-torus', { position: '0 0.71 0.01', rotation: '90 0 0', radius: 0.085, 'radius-tubular': 0.015, material: { color: dark ? '#444444' : '#222222', roughness: 0.9 } }, g);
      mk('a-text', { value: 'GAMYN', align: 'center', color: logoColor, width: 1.3, position: '0 0.5 0.065' }, g);
    }
    return g;
  }

  AFRAME.registerComponent('gamyn-catalog', {
    init: function () {
      this.items = [];
      this.near = null;
      this.last = 0;
      this.tmpA = new THREE.Vector3();
      this.tmpB = new THREE.Vector3();
      const self = this;
      const scene = this.el.sceneEl;
      const build = function () { PRODUCTS.forEach(function (p) { self.spawn(p); }); };
      if (scene.hasLoaded) build(); else scene.addEventListener('loaded', build);
    },

    spawn: function (p) {
      const self = this;
      const parent = document.querySelector(p.parent);
      if (!parent) { console.warn('[GAMYN] No existe el contenedor', p.parent, 'para', p.id); return; }

      whenLoaded(parent, function () {
        const base = new THREE.Vector3();
        if (p.slot !== undefined && parent.gamynSlots && parent.gamynSlots[p.slot]) base.copy(parent.gamynSlots[p.slot]);
        const off = AFRAME.utils.coordinates.parse(p.offset || '0 0 0');

        // holder = posición y rotación; pivot = giro opcional; scaler = tamaño y modelo
        const holder = mk('a-entity', {
          position: { x: base.x + off.x, y: base.y + off.y, z: base.z + off.z },
          rotation: p.rotation || '0 0 0'
        }, parent);
        const pivot = mk('a-entity', {}, holder);
        if (p.spin) pivot.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: ' + (p.spinDuration || 24000) + '; easing: linear; loop: true');

        const scaler = mk('a-entity', { scale: p.scale || '1 1 1' }, pivot);
        const usePlaceholder = function () {
          scaler.removeAttribute('gltf-model');
          scaler.appendChild(buildPlaceholder(p.placeholder || 'shirt', p.color || '#f5f5f5'));
        };
        if (p.model) {
          scaler.addEventListener('model-error', usePlaceholder);   // si no existe el .glb
          scaler.setAttribute('gltf-model', 'url(' + p.model + ')');
        } else {
          usePlaceholder();
        }

        // Área táctil invisible
        const hs = p.hit || {};
        const hit = mk('a-box', {
          position: '0 ' + (hs.y !== undefined ? hs.y : 0.5) + ' 0',
          width: hs.w || 0.9, height: hs.h || 1, depth: hs.d || 0.6,
          material: { opacity: 0, transparent: true, depthWrite: false }
        }, holder);
        hit.classList.add('clickable');
        hit.addEventListener('click', function () { UI.openInfo(p); });

        self.items.push({ p: p, holder: holder });
      });
    },

    tick: function (time) {
      if (time - this.last < 300) return;
      this.last = time;
      const cam = this.el.sceneEl.camera;
      if (!cam || !STATE.entered) return;
      cam.getWorldPosition(this.tmpA);
      let best = null, bd = CONFIG.nearDistance;
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].holder.object3D.getWorldPosition(this.tmpB);
        const dist = Math.hypot(this.tmpA.x - this.tmpB.x, this.tmpA.z - this.tmpB.z);
        if (dist < bd) { bd = dist; best = this.items[i]; }
      }
      if (best !== this.near) { this.near = best; UI.setNearby(best ? best.p : null); }
    }
  });

  /* ------------------------------------------------------------------
     3g. MOVIMIENTO: teclado (WASD/flechas/Q/E) + joystick + botones de giro
         Se coloca en el "rig" (el cuerpo del visitante).
     ------------------------------------------------------------------ */
  AFRAME.registerComponent('gamyn-move', {
    schema: { speed: { default: 3.2 }, turnSpeed: { default: 1.8 } },
    init: function () {
      const self = this;
      this.keys = {};
      this.camEl = document.getElementById('camera');
      window.addEventListener('keydown', function (e) { self.keys[e.key.toLowerCase()] = true; });
      window.addEventListener('keyup',   function (e) { self.keys[e.key.toLowerCase()] = false; });

      // Palanca izquierda del control de realidad virtual
      const left = document.getElementById('hand-left');
      if (left) left.addEventListener('thumbstickmoved', function (e) {
        STATE.input.vrx = e.detail.x; STATE.input.vry = -e.detail.y;
      });
    },
    tick: function (time, delta) {
      if (!STATE.entered) return;
      const dt = Math.min(delta, 50) / 1000;
      const k = this.keys, inp = STATE.input, d = this.data;
      const rig = this.el.object3D;

      let fx = (k['d'] ? 1 : 0) - (k['a'] ? 1 : 0) + inp.x + inp.vrx;
      let fy = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0) + inp.y + inp.vry;
      const len = Math.hypot(fx, fy);
      if (len > 1) { fx /= len; fy /= len; }

      const turn = inp.turn + ((k['arrowleft'] || k['q']) ? 1 : 0) - ((k['arrowright'] || k['e']) ? 1 : 0);
      if (turn) rig.rotation.y += turn * d.turnSpeed * dt;

      if (!fx && !fy) return;

      const yaw = rig.rotation.y + (this.camEl ? this.camEl.object3D.rotation.y : 0);
      const sin = Math.sin(yaw), cos = Math.cos(yaw);
      let x = rig.position.x + (-sin * fy + cos * fx) * d.speed * dt;
      let z = rig.position.z + (-cos * fy - sin * fx) * d.speed * dt;

      // Límites de la sala
      const b = CONFIG.bounds;
      x = Math.max(b.minX, Math.min(b.maxX, x));
      z = Math.max(b.minZ, Math.min(b.maxZ, z));
      // Obstáculos redondos (pedestales)
      CONFIG.obstacles.forEach(function (o) {
        const dx = x - o.x, dz = z - o.z, dist = Math.hypot(dx, dz);
        if (dist < o.r) {
          const f = o.r / (dist || 0.0001);
          x = o.x + dx * f; z = o.z + dz * f;
        }
      });
      rig.position.x = x; rig.position.z = z;
    }
  });

  /* ------------------------------------------------------------------
     4. INTERFAZ (HTML): bienvenida, joystick, ficha de prenda
     ------------------------------------------------------------------ */
  const $ = function (id) { return document.getElementById(id); };

  const UI = {
    openInfo: function (p) {
      const i = p.info || {};
      $('info-collection').textContent = i.collection || 'GAMYN — COLLECTION 01';
      $('info-name').textContent = i.name || p.id;
      $('info-desc').textContent = i.description || '';
      $('info-material').textContent = i.material || '—';
      $('info-concept').textContent = i.concept || '—';
      $('info-price').textContent = i.price || '—';
      $('info-panel').hidden = false;
    },
    closeInfo: function () { $('info-panel').hidden = true; },
    setNearby: function (p) {
      const b = $('nearby');
      if (!p) { b.hidden = true; return; }
      b.textContent = 'Ver prenda · ' + ((p.info && p.info.name) || p.id);
      b.onclick = function () { UI.openInfo(p); };
      b.hidden = false;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    // En celular quitamos las luces "solo computador"
    if (IS_MOBILE) document.querySelectorAll('[data-desktop-only]').forEach(function (e) { e.remove(); });

    const scene = $('scene');
    const enter = $('enter');

    // Limita la resolución para que el celular no se ahogue
    scene.addEventListener('renderstart', function () {
      scene.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2));
    });

    // El botón se activa cuando la escena terminó de cargar
    const ready = function () { enter.disabled = false; enter.textContent = 'ENTRAR AL MUSEO'; };
    if (scene.hasLoaded) ready(); else scene.addEventListener('loaded', ready);

    // Música opcional
    let music = null;
    if (CONFIG.audioSrc) { music = new Audio(CONFIG.audioSrc); music.loop = true; music.volume = 0.4; }

    enter.addEventListener('click', function () {
      const w = $('welcome');
      w.classList.add('hide');
      setTimeout(function () { w.hidden = true; }, 900);
      $('hud').hidden = false;
      STATE.entered = true;
      if (music) music.play().catch(function (e) { console.warn('[GAMYN] Audio no pudo sonar:', e); });
      if (IS_MOBILE && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
    });

    // ----- Joystick táctil -----
    const base = $('joystick'), knob = $('joystick-knob');
    let pid = null;
    function stick(e) {
      const r = base.getBoundingClientRect();
      const max = r.width / 2;
      let dx = e.clientX - (r.left + max), dy = e.clientY - (r.top + max);
      const len = Math.hypot(dx, dy);
      if (len > max) { dx *= max / len; dy *= max / len; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      STATE.input.x = dx / max;
      STATE.input.y = -dy / max;
    }
    function stickEnd(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      knob.style.transform = '';
      STATE.input.x = 0; STATE.input.y = 0;
    }
    base.addEventListener('pointerdown', function (e) { pid = e.pointerId; base.setPointerCapture(pid); stick(e); e.preventDefault(); });
    base.addEventListener('pointermove', function (e) { if (e.pointerId === pid) stick(e); });
    base.addEventListener('pointerup', stickEnd);
    base.addEventListener('pointercancel', stickEnd);

    // ----- Botones de giro -----
    document.querySelectorAll('#turn-buttons button').forEach(function (btn) {
      const dir = parseFloat(btn.dataset.turn);
      const stop = function () { STATE.input.turn = 0; };
      btn.addEventListener('pointerdown', function (e) { STATE.input.turn = dir; e.preventDefault(); });
      btn.addEventListener('pointerup', stop);
      btn.addEventListener('pointerleave', stop);
      btn.addEventListener('pointercancel', stop);
    });

    // ----- Cerrar la ficha -----
    $('info-close').addEventListener('click', UI.closeInfo);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') UI.closeInfo(); });
  });
})();
