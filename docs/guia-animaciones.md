# Guía de animaciones web: GSAP, Motion y Lenis

> De junior a experto en animación web, aplicado a **DevSignals** (React 19 + Vite + Tailwind 4).
>
> Esta guía está escrita para que **entiendas** lo que haces, no para que copies código. Cada sección explica el *porqué* antes del *cómo*. Léela en orden la primera vez; después úsala como referencia.

---

## Índice

1. [El panorama: por qué estas 3 librerías](#1-el-panorama-por-qué-estas-3-librerías)
2. [Fundamentos que necesitas ANTES de tocar GSAP](#2-fundamentos-que-necesitas-antes-de-tocar-gsap)
3. [GSAP: el motor de animación](#3-gsap-el-motor-de-animación)
4. [GSAP + React: el hook useGSAP](#4-gsap--react-el-hook-usegsap)
5. [Timelines: coreografía](#5-timelines-coreografía)
6. [ScrollTrigger: animar con el scroll](#6-scrolltrigger-animar-con-el-scroll)
7. [Lenis: smooth scroll](#7-lenis-smooth-scroll)
8. [Motion (Framer Motion): animación declarativa](#8-motion-framer-motion-animación-declarativa)
9. [¿GSAP o Motion? Cuándo usar cada una](#9-gsap-o-motion-cuándo-usar-cada-una)
10. [Implementación paso a paso en DevSignals](#10-implementación-paso-a-paso-en-devsignals)
11. [Rendimiento y accesibilidad](#11-rendimiento-y-accesibilidad)
12. [Errores típicos de junior (y cómo evitarlos)](#12-errores-típicos-de-junior-y-cómo-evitarlos)
13. [Roadmap: de aquí a "espectacular"](#13-roadmap-de-aquí-a-espectacular)
14. [Recursos](#14-recursos)

---

## 1. El panorama: por qué estas 3 librerías

Cuando ves una web premiada en Awwwards, casi siempre hay una combinación de estas tres piezas, y cada una resuelve un problema **distinto**:

| Librería | Qué resuelve | Analogía |
|---|---|---|
| **GSAP** | Animar *cualquier cosa* con control total: timelines, scroll, SVG, texto | El motor y la caja de cambios |
| **Motion** (antes Framer Motion) | Animaciones de UI declarativas dentro de React: hover, entrada/salida de componentes, layout | El piloto automático |
| **Lenis** | Suavizar el scroll nativo del navegador | La suspensión del coche |

La confusión típica de junior es pensar que compiten entre sí. **No compiten**: muchas webs top usan las tres a la vez. Lenis suaviza el scroll, GSAP orquesta las animaciones ligadas a ese scroll, y Motion se encarga de micro-interacciones de componentes (un modal que entra, un botón que reacciona al hover).

La pregunta correcta no es "¿cuál aprendo?", sino "¿qué problema tengo delante?". La sección 9 te da el criterio de decisión; primero necesitas entender cómo funciona cada una.

**Nota importante (2025):** GSAP fue adquirida por Webflow y desde la versión 3.13 **todos sus plugins son gratuitos**, incluidos los que antes eran de pago (SplitText, ScrollSmoother, MorphSVG, DrawSVG, ScrambleText…). Si ves tutoriales antiguos hablando de "Club GreenSock" o membresías, ignóralo: hoy todo viene en el paquete `gsap` de npm.

---

## 2. Fundamentos que necesitas ANTES de tocar GSAP

Esto es lo que separa a quien copia código de quien sabe animar. Son 4 conceptos.

### 2.1 Qué es una animación, de verdad

Una animación es **interpolación**: tienes un valor A, un valor B, y una función que calcula todos los valores intermedios a lo largo del tiempo. Nada más.

```
opacity: 0  ──────────────►  opacity: 1
           t=0s        t=0.5s
```

El navegador pinta ~60 frames por segundo. Una animación de 0.5s son ~30 frames, y en cada frame alguien (CSS, GSAP, Motion) calcula "¿qué valor toca ahora?" y lo aplica. GSAP hace esto con un *ticker* interno sincronizado con `requestAnimationFrame`.

### 2.2 Easing: el alma de la animación

Si la interpolación fuera lineal (velocidad constante), todo se vería robótico. El **easing** es la curva que define cómo se acelera y frena el movimiento:

- `linear` → velocidad constante. Casi nunca lo quieres (excepto en scroll scrubbing o loops infinitos).
- `ease-out` (empieza rápido, frena al final) → **el 80% de lo que harás**. Los elementos que *entran* en pantalla usan ease-out: aparecen con energía y aterrizan suavemente.
- `ease-in` (empieza lento, acelera) → para elementos que *salen* de pantalla.
- `elastic`, `back`, `bounce` → efectos con personalidad (rebotes, sobrepasar el destino y volver).

Regla de oro que uso desde hace años: **entrar = ease-out, salir = ease-in, mover de sitio = ease-in-out**. Cuando dudes, `power2.out` (nomenclatura GSAP) es el navajero suizo.

Juega con <https://gsap.com/docs/v3/Eases/> — el visualizador interactivo es la mejor forma de interiorizarlo.

### 2.3 Qué propiedades son baratas de animar

El navegador renderiza en fases: **Layout → Paint → Composite**. Cuanto más arriba tocas, más caro:

- 🟢 **Baratas** (solo composite, van por GPU): `transform` (translate, scale, rotate) y `opacity`. Anima SIEMPRE con estas cuando puedas.
- 🟡 **Medias** (repaint): `color`, `background`, `box-shadow`.
- 🔴 **Caras** (relayout de toda la página): `width`, `height`, `top`, `left`, `margin`, `padding`.

Por eso GSAP usa `x` e `y` (que son `transform: translate`) en vez de `left`/`top`. Si animas `left: 100px` la página recalcula el layout 60 veces por segundo; si animas `x: 100` solo se mueve una capa en la GPU.

### 2.4 El problema específico de React

React re-renderiza componentes y el DOM que ves puede ser destruido y recreado. Una librería imperativa como GSAP guarda referencias a nodos del DOM, así que hay dos peligros:

1. **Fugas**: animaciones que siguen corriendo sobre nodos que ya no existen.
2. **StrictMode**: en desarrollo, React 18+ monta los efectos **dos veces**, así que cualquier animación creada en un `useEffect` sin limpieza se duplica.

La solución oficial es el hook `useGSAP` (sección 4), que hace la limpieza automáticamente. Motion no tiene este problema porque *es* un componente de React y vive dentro de su ciclo de vida.

---

## 3. GSAP: el motor de animación

### 3.1 Instalación en este proyecto

```bash
cd frontend
pnpm add gsap @gsap/react
```

Y si vas a usar Lenis y Motion más adelante:

```bash
pnpm add lenis motion
```

### 3.2 El vocabulario esencial: tween

Un **tween** (de "in-between") es una animación individual. GSAP tiene 4 métodos para crearlos:

```ts
import gsap from "gsap"

// to: desde el estado ACTUAL hacia los valores que indicas (el más usado)
gsap.to(".card", { x: 100, opacity: 1, duration: 0.6 })

// from: desde los valores que indicas hacia el estado ACTUAL
// (perfecto para entradas: el elemento "llega" a donde el CSS ya lo puso)
gsap.from(".card", { y: 40, opacity: 0, duration: 0.6 })

// fromTo: controlas ambos extremos explícitamente
gsap.fromTo(".card", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 })

// set: sin animación, aplica valores al instante (un "to" con duration: 0)
gsap.set(".card", { opacity: 0 })
```

Anatomía de la llamada:

```ts
gsap.to(
  targets,   // selector CSS, elemento del DOM, ref, o array de cualquiera de ellos
  vars       // objeto con QUÉ animar + CÓMO animarlo
)
```

### 3.3 Las propiedades del objeto `vars`

```ts
gsap.to(".card", {
  // ── QUÉ animar (cualquier propiedad CSS, con atajos para transforms) ──
  x: 100,            // transform: translateX(100px)
  y: -50,            // transform: translateY(-50px)
  rotation: 360,     // transform: rotate(360deg)
  scale: 1.2,
  opacity: 0.5,
  autoAlpha: 0,      // opacity + visibility:hidden al llegar a 0 (mejor que opacity para ocultar)
  backgroundColor: "#8b5cf6",  // camelCase para propiedades CSS

  // ── CÓMO animarlo ──
  duration: 0.8,     // segundos (default: 0.5)
  delay: 0.2,
  ease: "power2.out",
  repeat: 2,         // -1 = infinito
  yoyo: true,        // en cada repetición, vuelve al origen (ping-pong)
  stagger: 0.1,      // si targets son VARIOS elementos, escalona el inicio de cada uno

  // ── callbacks ──
  onStart: () => {},
  onComplete: () => {},
  onUpdate: () => {},
})
```

### 3.4 Stagger: tu primer "wow" barato

`stagger` anima una lista de elementos en cascada. Es el efecto con mejor ratio esfuerzo/impacto que existe:

```ts
// Las 4 cards del dashboard entran una tras otra
gsap.from(".stat-card", {
  y: 30,
  opacity: 0,
  duration: 0.6,
  ease: "power2.out",
  stagger: 0.08,   // 80ms entre cada card
})
```

Stagger avanzado (objeto en vez de número):

```ts
stagger: {
  each: 0.08,        // tiempo entre elementos
  from: "center",    // desde dónde empieza la ola: "start" | "center" | "end" | "edges" | índice
  ease: "power1.in", // la distribución de los delays también puede tener curva
}
```

### 3.5 Eases de GSAP: la nomenclatura

Formato: `"nombre.dirección"`. Direcciones: `.in` (acelera), `.out` (frena), `.inOut` (ambas).

| Ease | Sensación | Úsalo para |
|---|---|---|
| `power1.out` → `power4.out` | De suave a agresivo | Entradas. `power2.out` es el default sensato |
| `back.out(1.7)` | Se pasa del destino y vuelve | Botones, badges, elementos juguetones |
| `elastic.out(1, 0.3)` | Rebote de muelle | Notificaciones, iconos con personalidad |
| `expo.out` | Frenazo dramático | Hero sections, títulos grandes |
| `sine.inOut` | Muy suave, orgánico | Loops infinitos, elementos flotando |
| `bounce.out` | Pelota que bota | Casi nunca 🙂 con moderación |
| `"steps(5)"` | A saltos discretos | Sprites, contadores, efecto terminal |

### 3.6 Controlar una animación

`gsap.to()` devuelve un objeto Tween que puedes guardar y controlar:

```ts
const tween = gsap.to(".box", { x: 300, duration: 2, paused: true })

tween.play()
tween.pause()
tween.reverse()      // ¡reproduce hacia atrás! clave para hovers
tween.restart()
tween.seek(1)        // salta al segundo 1
tween.timeScale(2)   // velocidad x2
tween.progress(0.5)  // salta al 50%
tween.kill()         // destruye la animación (limpieza)
```

Este control imperativo es el superpoder de GSAP: una animación es un **objeto con estado que puedes manipular**, no un fire-and-forget como una transición CSS.

---

## 4. GSAP + React: el hook useGSAP

### 4.1 El problema que resuelve

Sin ayuda, integrar GSAP en React requiere que tú manualmente: (a) esperes a que el DOM exista, (b) limpies las animaciones al desmontar, (c) sobrevivas al doble-montaje de StrictMode. `useGSAP` (del paquete oficial `@gsap/react`) hace las tres cosas.

Por debajo usa `gsap.context()`, que "graba" todas las animaciones creadas dentro de su callback y permite revertirlas todas de golpe con una sola llamada. `useGSAP` invoca ese revert automáticamente al desmontar el componente.

### 4.2 Uso básico

```tsx
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export function StatCards() {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            // Todo lo que crees aquí se limpia solo al desmontar
            gsap.from(".stat-card", {
                y: 30,
                opacity: 0,
                stagger: 0.08,
                ease: "power2.out",
            })
        },
        { scope: container } // 👈 clave: los selectores solo buscan DENTRO de container
    )

    return (
        <div ref={container} className="grid grid-cols-4 gap-4">
            <div className="stat-card">…</div>
            <div className="stat-card">…</div>
            <div className="stat-card">…</div>
            <div className="stat-card">…</div>
        </div>
    )
}
```

**`scope` es fundamental.** Sin él, `".stat-card"` seleccionaría TODAS las cards de la página, incluidas las de otros componentes. Con `scope`, los selectores de texto se comportan como si hicieras `container.current.querySelectorAll(...)`. Esto te permite usar clases sin miedo y sin necesidad de una ref por elemento.

### 4.3 Dependencias: re-ejecutar cuando cambian los datos

`useGSAP` acepta un array de dependencias como `useEffect`:

```tsx
useGSAP(
    () => {
        gsap.from(".chart-bar", { scaleY: 0, transformOrigin: "bottom", stagger: 0.05 })
    },
    { scope: container, dependencies: [data], revertOnUpdate: true }
)
```

- `dependencies: [data]` → el callback se re-ejecuta cuando `data` cambia (útil cuando el contenido llega de React Query, como en este proyecto).
- `revertOnUpdate: true` → antes de re-ejecutar, revierte las animaciones anteriores (sin esto, se acumularían).

### 4.4 contextSafe: animar en respuesta a eventos

Los handlers de eventos (click, hover) se ejecutan *después* de que el callback de `useGSAP` haya terminado, así que las animaciones que crees ahí no quedan registradas para limpieza… a menos que las envuelvas en `contextSafe`:

```tsx
export function LikeButton() {
    const btn = useRef<HTMLButtonElement>(null)
    const { contextSafe } = useGSAP({ scope: btn })

    const onClick = contextSafe(() => {
        gsap.fromTo(btn.current, { scale: 0.8 }, { scale: 1, ease: "back.out(3)", duration: 0.4 })
    })

    return <button ref={btn} onClick={onClick}>♥</button>
}
```

Regla mental: **animación al montar → dentro del callback de `useGSAP`; animación por evento → `contextSafe`**.

### 4.5 Registrar plugins (una sola vez)

Los plugins de GSAP (ScrollTrigger, SplitText…) se registran una vez, en un módulo que se importe pronto — en este proyecto, `frontend/src/main.tsx` o un `lib/gsap.ts`:

```ts
// frontend/src/lib/gsap.ts
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export { gsap, useGSAP, ScrollTrigger, SplitText }
```

Y en el resto del código importas siempre desde `@/lib/gsap` en vez de `gsap` directamente. Así garantizas el registro y tienes un único punto de configuración (defaults, matchMedia…).

---

## 5. Timelines: coreografía

### 5.1 Por qué existen

Con tweens sueltos, secuenciar es un infierno de `delay`s calculados a mano: si cambias la duración del primero, tienes que recalcular todos los demás. Un **timeline** es un contenedor que encadena tweens y mantiene las relaciones temporales por ti:

```ts
const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.6 } })

tl.from(".hero-title", { y: 60, opacity: 0 })
  .from(".hero-subtitle", { y: 40, opacity: 0 })   // empieza cuando acaba el anterior
  .from(".hero-cta", { scale: 0.8, opacity: 0 })
```

`defaults` aplica esas propiedades a todos los tweens del timeline — te ahorra repetirte.

### 5.2 El parámetro de posición: donde vive la magia

El tercer argumento de cada método controla *cuándo* empieza ese tween relativo al timeline. Es EL concepto que convierte animaciones correctas en animaciones con ritmo:

```ts
tl.from(".a", { opacity: 0 })            // t=0
  .from(".b", { opacity: 0 })            // al acabar .a (default: al final del timeline)
  .from(".c", { opacity: 0 }, "<")       // "<" = a la vez que empieza el ANTERIOR
  .from(".d", { opacity: 0 }, "<0.2")    // 0.2s después de que empiece el anterior
  .from(".e", { opacity: 0 }, "-=0.3")   // solapa 0.3s con el final del timeline
  .from(".f", { opacity: 0 }, "+=0.5")   // hueco de 0.5s
  .from(".g", { opacity: 0 }, 1.5)       // tiempo absoluto: segundo 1.5
```

**Consejo de senior:** las animaciones profesionales casi siempre **se solapan**. Si cada elemento espera a que el anterior termine del todo, el conjunto se siente lento y burocrático. Usa `"-=0.4"` o `"<0.1"` generosamente; el ojo percibe fluidez cuando las cosas ocurren en cascada solapada.

### 5.3 Labels y control

```ts
tl.addLabel("intro")
  .from(".title", { opacity: 0 })
  .addLabel("cards", "+=0.2")
  .from(".card", { y: 30, opacity: 0, stagger: 0.1 }, "cards")

tl.play("cards")        // salta a una sección
tl.tweenTo("intro")     // anima hasta un label (¡reproducción parcial!)
```

Un timeline tiene la misma API de control que un tween (`play`, `pause`, `reverse`, `timeScale`…). Patrón clásico: crear un timeline `paused: true` en `useGSAP`, guardarlo en una ref, y hacer `tl.play()` / `tl.reverse()` en el hover de un menú.

---

## 6. ScrollTrigger: animar con el scroll

El plugin más famoso de GSAP y el responsable de la mayoría de webs "espectaculares" que has visto. Vincula cualquier animación a la posición de scroll.

### 6.1 Modos de funcionamiento

Hay **dos modos** conceptualmente distintos; confundirlos es el error nº 1:

1. **Trigger (disparo):** cuando el elemento entra en el viewport, la animación *se reproduce* a su velocidad normal. Como un sensor de movimiento.
2. **Scrub (frotado):** la animación *está vinculada* a la barra de scroll — avanzas al hacer scroll hacia abajo, retrocede al subir. Como un vídeo cuyo cabezal es tu rueda del ratón.

### 6.2 Modo trigger: entradas al hacer scroll

```tsx
useGSAP(() => {
    gsap.from(".chart-section", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: ".chart-section",
            start: "top 80%",   // cuando el TOP del elemento cruza el 80% del viewport
            toggleActions: "play none none reverse",
        },
    })
}, { scope: container })
```

Desgranando `start: "top 80%"`: primer valor = punto del **elemento**, segundo = punto del **viewport**. `"top 80%"` significa "cuando el borde superior del elemento llega al 80% de la altura de la ventana" (es decir, cuando ya asoma un poco por abajo).

`toggleActions` define qué pasa en los 4 eventos: `onEnter onLeave onEnterBack onLeaveBack`. Valores: `play`, `pause`, `resume`, `reverse`, `restart`, `reset`, `complete`, `none`.

- `"play none none none"` → se anima una vez y ya está (lo más común para entradas).
- `"play none none reverse"` → se deshace si vuelves a subir (la página se siente "viva").

### 6.3 Modo scrub: cine controlado por scroll

```ts
gsap.to(".hero-bg", {
    scale: 1.3,
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",   // cuando el BOTTOM del hero llega al TOP del viewport
        scrub: true,          // 👈 vincula al scroll. scrub: 1 añade 1s de suavizado
    },
})
```

Con `scrub`, `duration` deja de significar segundos: las duraciones relativas entre tweens de un timeline definen qué *proporción* del recorrido de scroll ocupa cada uno.

### 6.4 Pin: congelar una sección

`pin: true` fija el elemento trigger mientras el scroll "pasa por encima". Es como funcionan esas secciones donde el fondo se queda quieto y el contenido va cambiando:

```ts
gsap.timeline({
    scrollTrigger: {
        trigger: ".steps-section",
        start: "top top",
        end: "+=2000",   // la sección queda fijada durante 2000px de scroll
        scrub: 1,
        pin: true,
    },
})
.from(".step-1", { opacity: 0, x: -50 })
.to(".step-1", { opacity: 0, x: 50 })
.from(".step-2", { opacity: 0, x: -50 })
// ...
```

### 6.5 markers: tu mejor amigo mientras aprendes

```ts
scrollTrigger: { trigger: ".foo", start: "top 80%", markers: true }
```

Dibuja en pantalla las líneas de start/end del trigger y del viewport. **Actívalo siempre que algo no dispare donde esperas** — el 90% de los problemas de ScrollTrigger son starts/ends mal imaginados, y con markers se ven al instante. Quítalo antes de commitear 🙂

### 6.6 batch: staggers eficientes al hacer scroll

Para listas largas (ej. resultados de búsqueda), un ScrollTrigger por elemento es despilfarro. `ScrollTrigger.batch` agrupa los que entran "a la vez" y les aplica un stagger conjunto:

```ts
ScrollTrigger.batch(".job-card", {
    start: "top 85%",
    onEnter: (batch) => gsap.from(batch, { y: 30, opacity: 0, stagger: 0.08 }),
    once: true,
})
```

---

## 7. Lenis: smooth scroll

### 7.1 Qué hace y por qué las webs top lo usan

El scroll nativo del navegador es instantáneo y "a saltos" (cada tick de rueda = salto brusco de N píxeles). Lenis lo intercepta y aplica interpolación exponencial (*lerp*): la página persigue suavemente la posición objetivo, con inercia. Es una diferencia sutil pero es EL ingrediente que hace que una web se sienta "cara". Además, un scroll suavizado hace que las animaciones con `scrub` se vean como mantequilla en vez de a tirones.

A diferencia de los smooth-scroll antiguos ("scrolljacking" que rompía la accesibilidad), Lenis mantiene el scroll nativo por debajo — la barra de scroll, el teclado y los anchors siguen funcionando.

### 7.2 Integración en React

```bash
pnpm add lenis
```

```tsx
// frontend/src/app/providers.tsx (o donde envuelvas la app)
import { ReactLenis } from "lenis/react"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
            {children}
        </ReactLenis>
    )
}
```

- `root` → suaviza el scroll de toda la página (el `<html>`).
- `lerp: 0.1` → cada frame recorre el 10% de la distancia restante. Más bajo = más "flotante" (0.05 muy suave, 0.15 más directo).

### 7.3 Sincronizar Lenis con ScrollTrigger (imprescindible)

ScrollTrigger escucha el scroll nativo, y Lenis lo está interceptando: si no los conectas, las animaciones de scroll van desincronizadas o a saltos. La conexión canónica es que GSAP pase a ser el "reloj" de Lenis:

```tsx
import { ReactLenis, useLenis } from "lenis/react"
import { useEffect, useRef } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import type { LenisRef } from "lenis/react"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<LenisRef>(null)

    useEffect(() => {
        // 1. Cada vez que Lenis scrollea, ScrollTrigger se actualiza
        lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update)

        // 2. El ticker de GSAP mueve a Lenis (un solo requestAnimationFrame para todo)
        const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000)
        gsap.ticker.add(update)
        gsap.ticker.lagSmoothing(0)

        return () => gsap.ticker.remove(update)
    }, [])

    return (
        <ReactLenis root ref={lenisRef} options={{ autoRaf: false }}>
            {children}
        </ReactLenis>
    )
}
```

Fíjate en `autoRaf: false`: le decimos a Lenis que no cree su propio loop porque lo va a conducir el ticker de GSAP. Un solo loop = un solo reloj = cero desincronización.

### 7.4 Detalles prácticos

- **Scroll programático:** `useLenis()` te da la instancia; `lenis.scrollTo("#seccion", { offset: -80 })` para anclas con header fijo.
- **Elementos con scroll interno** (modales, dropdowns largos): añádeles `data-lenis-prevent` para que Lenis no les robe la rueda.
- **React Router:** al navegar, el scroll no se resetea solo; haz `lenis.scrollTo(0, { immediate: true })` en un efecto que dependa de `location.pathname`.

---

## 8. Motion (Framer Motion): animación declarativa

### 8.1 La filosofía opuesta a GSAP

GSAP es **imperativo**: "coge esto y anímalo así". Motion es **declarativo**: describes el estado visual en el JSX y la librería descubre cómo llegar hasta él. Es la misma diferencia que entre manipular el DOM con jQuery y describir la UI con React.

```bash
pnpm add motion
```

```tsx
import { motion } from "motion/react"

<motion.div
    initial={{ opacity: 0, y: 20 }}    // estado al montar
    animate={{ opacity: 1, y: 0 }}     // estado objetivo
    transition={{ duration: 0.5, ease: "easeOut" }}
/>
```

Nota: el paquete se llama `motion` y se importa de `motion/react`. Si ves `framer-motion` en tutoriales, es la misma librería con su nombre antiguo.

### 8.2 Los superpoderes exclusivos de Motion

Hay cosas que en Motion son triviales y en GSAP requieren trabajo manual:

**1. Animar la salida de componentes (`AnimatePresence`).** En React, cuando un componente se desmonta, desaparece del DOM al instante — no hay forma nativa de animar su salida. `AnimatePresence` retiene el nodo hasta que la animación `exit` termina:

```tsx
import { AnimatePresence, motion } from "motion/react"

<AnimatePresence>
    {isOpen && (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}    // 👈 se anima ANTES de desmontarse
        />
    )}
</AnimatePresence>
```

Esto es oro para modales, toasts, dropdowns y transiciones de página con React Router.

**2. Gestos declarativos:**

```tsx
<motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    whileInView={{ opacity: 1 }}   // mini-ScrollTrigger integrado
/>
```

**3. Animaciones de layout.** La joya de la corona. `layout` anima automáticamente cualquier cambio de posición/tamaño causado por un re-render — reordenar una lista, expandir una card, mover un elemento entre contenedores:

```tsx
<motion.div layout />   // sí, solo eso

// Y layoutId conecta DOS elementos distintos: el "pill" que se desliza
// entre pestañas de un menú es esto:
{tabs.map((tab) => (
    <button key={tab} onClick={() => setActive(tab)}>
        {tab}
        {active === tab && <motion.div layoutId="underline" className="h-0.5 bg-violet-500" />}
    </button>
))}
```

**4. Física de muelles (springs).** En vez de duración+curva, defines rigidez y amortiguación, y el movimiento responde de forma natural incluso si lo interrumpes a mitad:

```tsx
transition={{ type: "spring", stiffness: 300, damping: 24 }}
```

### 8.3 Variants: orquestación declarativa

El equivalente Motion de un timeline sencillo con stagger:

```tsx
const list = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

<motion.ul variants={list} initial="hidden" animate="show">
    {skills.map((s) => <motion.li key={s.id} variants={item}>{s.name}</motion.li>)}
</motion.ul>
```

Los hijos heredan el estado del padre por nombre: cuando el `ul` pasa a `"show"`, cada `li` anima su propio variant `"show"` con el stagger definido en el padre. Muy elegante para listas dinámicas de React.

### 8.4 useScroll + useTransform: parallax a la Motion

```tsx
import { useScroll, useTransform, motion } from "motion/react"

const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
const y = useTransform(scrollYProgress, [0, 1], [0, -100])

<motion.div ref={ref} style={{ y }} />
```

Es capaz, pero para scroll complejo (pins, scrubs largos, coreografías) ScrollTrigger sigue siendo muy superior.

---

## 9. ¿GSAP o Motion? Cuándo usar cada una

Mi criterio después de años usando ambas:

| Situación | Usa | Por qué |
|---|---|---|
| Hover/tap en botones y cards | **Motion** (o CSS puro) | `whileHover` es una línea |
| Modal/toast/dropdown que entra y sale | **Motion** | `AnimatePresence` resuelve el desmontaje |
| Lista que se reordena o filtra | **Motion** | `layout` es magia que GSAP no tiene |
| Transiciones entre rutas | **Motion** | `AnimatePresence` + React Router |
| Secuencia de entrada de un hero (título → subtítulo → CTA → imagen) | **GSAP** | Los timelines con posiciones solapadas no tienen rival |
| Storytelling con scroll (pin, scrub, secciones cinemáticas) | **GSAP** ScrollTrigger | Motion se queda corto rápido |
| Animación de texto (títulos letra a letra) | **GSAP** SplitText | Hace el troceado y respeta accesibilidad |
| SVG: dibujar trazos, morphing de formas | **GSAP** DrawSVG/MorphSVG | Sin equivalente en Motion |
| Animar algo que NO es un componente React (canvas, número en un objeto, Three.js) | **GSAP** | Anima cualquier propiedad de cualquier objeto JS |
| Scroll suave global | **Lenis** | Es su único trabajo y lo hace perfecto |

**¿Se pueden usar juntas en el mismo proyecto?** Sí, y es lo habitual en webs top. La única regla: **no animes el mismo elemento con las dos a la vez** (se pelearían por el `transform`). Repártete: Motion para el "sistema de UI" (componentes, modales, listas), GSAP para las "escenas" (hero, secciones de scroll, texto).

Para DevSignals concretamente: es un dashboard, así que Motion cubrirá el 70% (micro-interacciones, transiciones de datos, modales) y GSAP el 30% de impacto (landing/hero, entradas coreografiadas, contadores).

---

## 10. Implementación paso a paso en DevSignals

Plan concreto para este repo, en orden de dificultad creciente. Hazlos tú — este es el gimnasio.

### Paso 0: infraestructura

1. `cd frontend && pnpm add gsap @gsap/react lenis motion`
2. Crea `src/lib/gsap.ts` como en la sección 4.5.
3. (Cuando llegues al paso 4) monta `SmoothScroll` de la sección 7.3 envolviendo el layout en `src/app/providers.tsx`.

### Paso 1: entrada del dashboard (GSAP básico + stagger)

En `MarketOverviewPage.tsx`, anima la entrada de los charts (`TopSkillsChart`, `TopRolesChart`, etc.):

```tsx
const container = useRef<HTMLDivElement>(null)

useGSAP(() => {
    gsap.from("[data-animate='chart-card']", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
        clearProps: "all",   // limpia los estilos inline al acabar (recharts a veces se queja de transforms residuales)
    })
}, { scope: container })
```

Añade `data-animate="chart-card"` a cada wrapper de chart. Usar data-attributes en vez de clases separa la semántica de animación del styling de Tailwind — te lo agradecerás al refactorizar.

⚠️ **Detalle real de este proyecto:** los datos vienen de React Query (`useMarketOverview`), así que los charts se montan cuando llegan los datos. Si animas al montar la página, animarás skeletons. Dos opciones: animar cuando `isSuccess` sea true (usa `dependencies: [isSuccess]`), o animar los propios skeletons y dejar que el swap de contenido sea instantáneo.

### Paso 2: reescribe `useScrambleText` con GSAP (aprender comparando)

Ya tienes `frontend/src/features/profile/hooks/useScrambleText.ts`: ~60 líneas de `setInterval`, timeouts y estados de fase gestionados a mano. Es exactamente el tipo de código que GSAP elimina. Con el plugin **ScrambleText** (ahora gratis):

```tsx
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
gsap.registerPlugin(ScrambleTextPlugin)

const { contextSafe } = useGSAP({ scope: ref })

const trigger = contextSafe((text: string) => {
    gsap.to(ref.current, {
        duration: 1,
        scrambleText: { text, chars: "01!@#$%^&*_-+=<>?", revealDelay: 0.1 },
        onComplete: () => gsap.to(ref.current, { autoAlpha: 0, delay: 3, duration: 0.5 }),
    })
})
```

El ejercicio valioso no es el resultado (será casi idéntico visualmente), sino **comparar los dos enfoques**: dónde fue a parar la gestión de fases, quién limpia los timers, qué pasa con StrictMode. Ahí entiendes qué te está dando GSAP.

### Paso 3: micro-interacciones con Motion

1. Convierte las cards de skills del `SkillSelector` en `motion.button` con `whileHover={{ scale: 1.03 }}` y `whileTap={{ scale: 0.97 }}`.
2. Cuando el usuario añade/quita skills, envuelve la lista con `AnimatePresence` y dale a cada item `layout` + `exit={{ opacity: 0, scale: 0.9 }}`. Verás la lista reorganizarse sola con animación. Requisito: `key` estable por skill (el id, nunca el índice).

### Paso 4: transiciones de ruta (Motion + React Router 7)

```tsx
// Un layout que anima la entrada/salida de cada página
import { AnimatePresence, motion } from "motion/react"
import { useLocation, Outlet } from "react-router-dom"

export function AnimatedLayout() {
    const location = useLocation()
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                <Outlet />
            </motion.div>
        </AnimatePresence>
    )
}
```

`mode="wait"` hace que la página saliente termine su exit antes de que entre la nueva. Sutil (¡0.25s, no más!) pero cambia por completo la sensación de calidad de la app.

### Paso 5: contadores animados (GSAP anima números, no solo DOM)

Para las métricas del dashboard ("1.245 ofertas analizadas"):

```tsx
useGSAP(() => {
    const counter = { value: 0 }
    gsap.to(counter, {
        value: totalJobs,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
            if (ref.current) ref.current.textContent = Math.round(counter.value).toLocaleString("es-ES")
        },
    })
}, { dependencies: [totalJobs] })
```

Fíjate: GSAP está animando **un objeto JavaScript plano**, no un elemento. Este patrón (animar datos y pintar en `onUpdate`) sirve para canvas, WebGL, Recharts… cualquier cosa.

### Paso 6: una landing con scroll storytelling (el proyecto final)

Cuando domines lo anterior, monta una landing pública para DevSignals: hero con SplitText en el título, Lenis global, secciones que entran con ScrollTrigger, una sección pinneada explicando el producto en 3 pasos con scrub, y contadores que se disparan al entrar en viewport. Eso es exactamente el stack de una web de Awwwards, aplicado a tu producto.

---

## 11. Rendimiento y accesibilidad

### Rendimiento

1. **`transform` y `opacity` casi siempre.** Si te pillas animando `width` o `top`, para y busca el equivalente con `scale`/`x`/`y`.
2. **No animes 200 elementos a la vez.** Usa `ScrollTrigger.batch`, o anima el contenedor.
3. **`will-change` con moderación** — GSAP ya gestiona la promoción a capa GPU (`force3D`); añadirlo a mano en todo es contraproducente.
4. **Mide con DevTools → Performance.** Graba mientras la animación corre; si ves frames rojos (>16ms), busca qué propiedad está causando Layout.
5. **Skeletons + animación no se mezclan bien**: decide qué animas — la llegada del layout o la llegada de los datos — pero no ambos en cadena o la página tardará en "asentarse".

### Accesibilidad: `prefers-reduced-motion`

Hay usuarios a los que el movimiento les marea (trastornos vestibulares). Respetar su preferencia del sistema no es opcional en un trabajo profesional. GSAP lo hace elegante con `matchMedia`:

```ts
useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Animación completa
        gsap.from(".card", { y: 30, opacity: 0, stagger: 0.1 })
    })

    mm.add("(prefers-reduced-motion: reduce)", () => {
        // Solo un fade discreto, sin movimiento
        gsap.from(".card", { opacity: 0, duration: 0.3 })
    })
}, { scope: container })
```

`gsap.matchMedia()` también sirve para animaciones distintas por breakpoint (`"(min-width: 768px)"`), y revierte todo automáticamente cuando la media query deja de cumplirse. En Motion, existe `useReducedMotion()` para lo mismo.

Bonus: `gsap.matchMedia` combina perfectamente con los breakpoints de Tailwind — usa los mismos valores de px y las animaciones móviles/desktop quedarán alineadas con tu CSS.

---

## 12. Errores típicos de junior (y cómo evitarlos)

1. **FOUC con `gsap.from`** — el elemento se ve un frame en su estado final antes de que la animación lo oculte, y parpadea. Solución: ponle `opacity: 0` (o una clase) en el CSS inicial y usa `gsap.to`, o usa `autoAlpha` que gestiona `visibility`.

2. **Crear animaciones en `useEffect` a pelo.** Con StrictMode se duplican y no se limpian. Usa `useGSAP` siempre; es exactamente para esto.

3. **Selectores globales sin `scope`.** Tu `gsap.from(".card")` anima las cards de OTRO componente. Siempre `{ scope: containerRef }`.

4. **Animar `height: auto`.** No se puede interpolar hacia `auto` directamente. Alternativas: `maxHeight`, medir con `scrollHeight`, el componente `motion.div` con `animate={{ height: "auto" }}` (Motion sí sabe hacerlo), o `grid-template-rows: 0fr → 1fr` en CSS puro.

5. **Duraciones demasiado largas.** El error estético más común. Micro-interacciones: 0.15–0.3s. Entradas de elementos: 0.4–0.8s. Solo las escenas hero justifican >1s. Si el usuario espera a tu animación, has fallado.

6. **Todo anima = nada destaca.** La animación es jerarquía visual: guía el ojo hacia lo importante. Si las 15 cosas de la pantalla se mueven, el usuario no sabe dónde mirar. Menos y mejor.

7. **ScrollTrigger que "no funciona"** y era que: (a) el trigger estaba dentro de un contenedor con `overflow: hidden`, (b) las imágenes cargaron después y movieron todos los starts (llama a `ScrollTrigger.refresh()` cuando cargue el contenido), o (c) los starts no eran donde imaginabas → `markers: true`.

8. **Olvidar el estado final.** `gsap.from` deja estilos inline al terminar. Si luego ese elemento debe responder a CSS/Tailwind (hover, dark mode), usa `clearProps: "all"` en el tween para limpiar al acabar.

9. **Animar con `left/top` o `margin`.** Ya lo sabes: `x`/`y`.

10. **No probar con el ratón, trackpad Y teclado.** Especialmente con Lenis: verifica que PageDown, la rueda, el trackpad y los enlaces ancla funcionan.

---

## 13. Roadmap: de aquí a "espectacular"

Plan realista dedicándole unas horas por semana. La clave: **construir cada semana, no solo leer**.

**Semana 1–2 · Fundamentos GSAP.** Tweens, eases, stagger, `useGSAP`. Haz el Paso 1 y el Paso 2 de la sección 10. Meta: entrada del dashboard animada y `useScrambleText` reescrito, entendiendo cada línea.

**Semana 3 · Timelines.** Coreografía con parámetros de posición. Haz una intro de página completa (título → subtítulo → contenido) con solapamientos. Reprodúcela hacia atrás con un botón. Meta: sentirte cómodo con `"<"`, `"-=0.3"` y labels.

**Semana 4–5 · ScrollTrigger.** Primero modo trigger (entradas al scrollear con `toggleActions`), luego scrub, luego pin. Haz el Paso 6 sin Lenis todavía. Meta: una sección pinneada con scrub que no te dé miedo tocar.

**Semana 6 · Lenis + integración.** Monta el smooth scroll global y sincronízalo con ScrollTrigger. Nota la diferencia en los scrubs. Meta: el "feel" premium.

**Semana 7–8 · Motion.** `motion.div`, `AnimatePresence`, variants, `layout`/`layoutId`, springs. Haz los Pasos 3 y 4. Meta: modales, listas y transiciones de ruta con salida animada.

**Semana 9–10 · Texto y SVG.** SplitText (títulos por líneas/palabras/letras + stagger — el efecto firma de las webs top), DrawSVG para trazos, Flip para transiciones de estado imposibles. Meta: un hero con título animado por líneas del que estés orgulloso.

**Semana 11+ · Réplicas.** El ejercicio que de verdad te sube de nivel: entra en [Awwwards](https://www.awwwards.com) o [Godly](https://godly.website), elige UNA sección de una web premiada e **replícala**. Al principio tardarás días por sección; ese sufrimiento es el aprendizaje. Tres réplicas después, verás una web y sabrás leer sus animaciones como quien lee código.

**El salto a experto** no es saber más API, es criterio: saber *cuándo no animar*, elegir duraciones y eases sin dudar, y que el movimiento cuente la historia del producto en vez de decorarlo. Eso solo se entrena construyendo y copiando a los mejores.

---

## 14. Recursos

**Documentación (excelente en los tres casos):**
- GSAP: <https://gsap.com/docs/v3/> — y el visualizador de eases: <https://gsap.com/docs/v3/Eases/>
- useGSAP / React: <https://gsap.com/resources/React/>
- Motion: <https://motion.dev/docs/react>
- Lenis: <https://github.com/darkroomengineering/lenis>

**Para aprender:**
- GSAP demos oficiales en CodePen: <https://codepen.io/GreenSock> — desmonta demos, es la mejor escuela
- Codrops (<https://tympanus.net/codrops/>): tutoriales de efectos de nivel Awwwards con código
- Canal de YouTube "GSAP" (oficial) y los streams de Cassie Evans

**Para inspirarte (y robar con los ojos):**
- <https://www.awwwards.com> · <https://godly.website> · <https://www.curated.design>

**Principios de motion design (el "porqué" estético):**
- Material Design Motion: <https://m3.material.io/styles/motion/overview>
- "The Illusion of Life" — los 12 principios de animación de Disney aplican también a UI

---

*Guía creada para DevSignals · julio 2026. Empieza por el Paso 1 de la sección 10 y no avances hasta poder explicarle a otra persona cada línea que escribas.*
