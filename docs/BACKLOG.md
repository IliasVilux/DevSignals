# DevSignals — Feature Backlog

Backlog de posibles features para llevar DevSignals al siguiente nivel como proyecto de portfolio.

**Contexto:** DevSignals no es un portal de empleo — es una plataforma de *inteligencia de mercado* para developers. Todo lo que se proponga aquí debe reforzar esa identidad: convertir datos de ofertas en insights accionables. Las features están ordenadas por su relación impacto/esfuerzo pensando en dos audiencias: usuarios reales y entrevistadores técnicos que revisen el código.

**Estado actual (v0.7):** ingesta desde Adzuna (5 países), extracción de ~70 skills, market overview con agregaciones TypedSQL, caché Redis, OAuth (Google/GitHub), perfil de usuario con skills y niveles de proficiencia. Próximo hito planeado: **v0.8 — personal match scoring**.

Leyenda de esfuerzo: 🟢 pequeño (días) · 🟡 medio (1–2 semanas) · 🔴 grande (varias semanas)

---

## Tier 1 — Features de producto diferenciadoras

Las que convierten el proyecto de "dashboard bonito" a "producto con propuesta de valor única". Son las que más conversación generan en una entrevista.

### 1.1 Personal Market Fit Score (v0.8 — ya planeado) 🟡

El corazón del producto. Cruzar las `UserSkill` (con nivel) del usuario contra la demanda real del mercado (`JobSkill`) y devolver un score de encaje por país/rol.

- **Qué hace:** "Tu perfil encaja con el 68% de las ofertas de Backend Engineer en España". Desglose: skills que suman, skills que faltan, peso de cada una según su frecuencia en el mercado.
- **Por qué encaja:** es la culminación natural de todo lo construido — el perfil de v0.7 existe *para esto*. Sin ello, el selector de skills es solo un formulario.
- **Qué demuestra:** diseño de un algoritmo de scoring explicable (no una caja negra), agregaciones SQL no triviales, y cómo el nivel de proficiencia (BASIC/INTERMEDIATE/ADVANCED) pondera el resultado.
- **Notas de implementación:** nuevo endpoint `GET /api/profile/match?countryCode=&role=`. El score puede ser: `Σ(peso_mercado(skill) × factor_nivel) / Σ(peso_mercado(todas las skills demandadas))`. Cachear por usuario+filtros con TTL corto. El desglose ("te falta Docker, presente en el 40% de ofertas") alimenta directamente la feature 2.2.

### 1.2 Tendencias históricas (time-series de demanda) 🔴

Hoy el cleanup semanal borra jobs de >30 días, así que **el histórico se pierde para siempre**. Esta feature lo rescata antes de destruirlo.

- **Qué hace:** gráficas de evolución temporal — "demanda de React en GB en los últimos 6 meses", "evolución del % remoto en España".
- **Por qué encaja:** el README ya promete "technology demand trends" como idea core, pero hoy solo hay fotos fijas. Las tendencias son EL insight que un developer quiere ver.
- **Qué demuestra:** diseño de datos orientado a agregados (snapshots vs raw data), trade-off almacenamiento/precisión, charts temporales.
- **Notas de implementación:** nueva tabla `MarketSnapshot` (`{ weekOf, countryId, role?, skillId?, jobCount, avgSalary, remotePct }`) poblada por un cron semanal *antes* del cleanup. Los jobs crudos se siguen borrando; los agregados son diminutos y viven para siempre. Nuevo endpoint `GET /api/market/trends`. **Urgente empezar a snapshotear ya:** cada semana que pasa sin snapshots es histórico perdido — se puede desplegar solo el cron de snapshots mucho antes que la UI.

### 1.3 Página de detalle por skill (`/skills/react`) 🟡

- **Qué hace:** una página por tecnología: demanda total, salario medio de ofertas que la piden, distribución remota, países donde más se pide, skills que co-ocurren ("quien pide React suele pedir TypeScript, Next.js…").
- **Por qué encaja:** convierte el dashboard en un producto navegable con profundidad. La co-ocurrencia sale gratis del grafo `JobSkill` que ya existe.
- **Qué demuestra:** SQL de co-ocurrencia (self-join sobre `JobSkill`), routing dinámico, diseño de páginas de detalle. Además genera muchas URLs indexables → SEO.
- **Notas de implementación:** `GET /api/skills/:name/insights`. La query de co-ocurrencia: joins de `JobSkill` consigo misma agrupando por la skill compañera. Cachear agresivamente (cambia solo con cada ingesta).

### 1.4 Prima salarial por skill 🟢

- **Qué hace:** "Las ofertas que mencionan Kubernetes pagan de media un 18% más que las que no". Ranking de skills por impacto salarial, por país/rol.
- **Por qué encaja:** insight accionable inmediato ("¿qué aprendo para ganar más?") con datos que ya están en la DB. Muy compartible → tracción.
- **Qué demuestra:** una agregación SQL comparativa elegante (AVG con skill vs AVG sin skill) y honestidad estadística (mínimo de muestras, avisar de correlación ≠ causalidad).
- **Notas de implementación:** nueva TypedSQL query; añadir sección al overview o al detalle de skill. Excluir skills con < N ofertas con salario para no publicar ruido.

### 1.5 Comparador de países / roles (side-by-side) 🟢

- **Qué hace:** vista `ES vs DE` o `Backend vs Frontend`: salario, % remoto, top skills, volumen — en columnas comparadas.
- **Por qué encaja:** la pregunta real del usuario europeo es "¿me compensa mirar Alemania?". Los 5 países seeded lo piden a gritos.
- **Qué demuestra:** reutilización limpia del endpoint overview (dos queries en paralelo con TanStack Query), diseño de UI comparativa, estado en la URL (`/compare?a=ES&b=DE`) → compartible.
- **Notas de implementación:** casi todo frontend; el backend ya lo soporta con el endpoint actual. Quick win con mucho efecto visual.

---

## Tier 2 — Engagement y alcance

Features que hacen que la gente *vuelva* y que el proyecto se vea fuera de tu GitHub.

### 2.1 Digest semanal por email 🟡

- **Qué hace:** email semanal personalizado según las skills del perfil: "Tu stack esta semana: demanda de TypeScript +5%, salario medio Backend en ES: 42k…".
- **Por qué encaja:** cierra el loop de retención y da un motivo para haber hecho login. Depende de 1.2 (snapshots) para los deltas.
- **Qué demuestra:** jobs programados con envío de email (Resend/Postmark free tier), plantillas (react-email), opt-in/opt-out, idempotencia de envíos. Producto real, no demo.
- **Notas de implementación:** campo `emailDigestOptIn` en `User`, cron semanal reutilizando el scheduler existente. Empezar con texto simple; la plantilla bonita después.

### 2.2 Skill gap / recomendaciones de aprendizaje 🟡

- **Qué hace:** a partir del match score (1.1): "Si añades Docker a tu perfil, tu encaje con Backend Engineer sube del 68% al 79%". Ranking de skills ordenado por ganancia marginal de score.
- **Por qué encaja:** es la versión accionable del match score — no solo te digo dónde estás, te digo qué mueve la aguja.
- **Qué demuestra:** razonamiento sobre el algoritmo propio (simular el score con cada skill añadida), producto orientado a decisión.
- **Notas de implementación:** puro cálculo en el servicio sobre datos que el match score ya carga; sin queries nuevas. Hacerlo justo después de 1.1.

### 2.3 Snapshots compartibles (imágenes OG / tarjetas) 🟢

- **Qué hace:** botón "compartir" que genera una tarjeta visual ("Top skills Backend España — Julio 2026") con OG tags para que se renderice bien en X/LinkedIn.
- **Por qué encaja:** cada share es marketing gratuito del proyecto — clave para "ponerlo en lo más alto".
- **Qué demuestra:** generación de imágenes en servidor o edge (`@vercel/og` / satori), meta tags dinámicas.

### 2.4 Estado en la URL + deep links 🟢

- **Qué hace:** los filtros del dashboard (país, rol) viven en query params (`/?country=ES&role=backend`). Cualquier vista es enlazable.
- **Por qué encaja:** prerequisito barato para 2.3 y para compartir cualquier cosa. Hoy los filtros son estado local y se pierden al recargar.
- **Qué demuestra:** `useSearchParams` como fuente de verdad, sincronización URL ↔ estado sin loops. Detalle de senior.

---

## Tier 3 — Profundidad de datos

Features que ensanchan la base de datos e insights. Más esfuerzo, más "wow" técnico.

### 3.1 Segunda fuente de ingesta 🔴

- **Qué hace:** añadir un segundo proveedor (candidatos: Remotive, Jooble, The Muse, USAJobs) junto a Adzuna.
- **Por qué encaja:** la capa `NormalizedJob` existe *exactamente* para esto — es la prueba de fuego de la arquitectura. En entrevista: "diseñé la normalización para ser agnóstica del proveedor, y aquí está la prueba".
- **Qué demuestra:** abstracción validada con un caso real, deduplicación cross-proveedor (misma oferta en dos fuentes), estrategia de reconciliación de campos.
- **Notas de implementación:** nuevo cliente + normalizador por proveedor; el resto del pipeline no cambia. Añadir `source` al modelo `Job`. La dedup (fuzzy match título+empresa) puede ser una fase 2 — empezar aceptando duplicados marcados por fuente.

### 3.2 Extractor de skills v2 🟡

- **Qué hace:** ampliar el diccionario (~70 → 150+ tecnologías), añadir detección de seniority (junior/mid/senior desde el título/texto) y años de experiencia pedidos.
- **Por qué encaja:** seniority habilita el insight más pedido: "salario por seniority". Multiplica el valor de todas las demás features (match score por seniority, trends por seniority…).
- **Qué demuestra:** evolución de un pipeline NLP-lite con test suite de regresión (el patrón regex-precompilado ya existe; se extiende).
- **Notas de implementación:** enum `Seniority` en `Job`, clasificador estilo `remote-classifier` (mismo patrón de módulo aislado ya establecido). Re-clasificar jobs existentes con un script backfill.

### 3.3 Búsqueda / autocompletado de skills y roles 🟢

- **Qué hace:** el input de rol pasa de texto libre a autocompletado contra roles reales normalizados en la DB; buscador de skills que enlaza a su página de detalle (1.3).
- **Por qué encaja:** el texto libre actual produce muchos "no jobs found"; el autocompletado convierte exploración a ciegas en navegación guiada.
- **Qué demuestra:** endpoint de sugerencias con `pg_trgm`/ILIKE, debounce (ya existe el hook), combobox accesible.

---

## Tier 4 — Excelencia de ingeniería

No son features de producto, pero son las que un revisor técnico de tu repo notará primero. Varias están ya reconocidas como deuda en los READMEs.

### 4.1 CI con GitHub Actions 🟢 ⭐ *el gap más visible del repo*

- **Qué hace:** workflow que corre lint + typecheck + tests (backend y frontend) en cada PR, con badge en el README.
- **Por qué encaja:** hay husky pre-commit pero **no hay `.github/workflows`**. Un proyecto de portfolio sin CI verde es una bandera roja instantánea para cualquier revisor; es la mejora con mejor ratio esfuerzo/impacto de todo este documento.
- **Notas de implementación:** matrix backend/frontend, pnpm cache, `pnpm test` + `pnpm lint` + `tsc --noEmit`. Un día de trabajo como mucho.

### 4.2 Validación de requests con Zod 🟢

- **Qué hace:** schemas Zod para query params y bodies, middleware de validación, errores 400 consistentes.
- **Por qué encaja:** listado explícitamente como "intentional simplification" en el README del backend — cerrar deuda documentada queda muy bien ("lo dejé fuera conscientemente, y lo pagué cuando tocó"). Con el crecimiento de endpoints de Tier 1–3, deja de ser opcional.

### 4.3 Documentación OpenAPI + Swagger UI 🟢

- **Qué hace:** spec OpenAPI de la API pública servida en `/api/docs`.
- **Por qué encaja:** el contrato ya está escrito en prosa en los READMEs — formalizarlo lo hace explorable en vivo. Un endpoint `/api/docs` navegable en la demo desplegada impresiona en 10 segundos.
- **Notas de implementación:** si se hace 4.2 primero, generar el spec desde los schemas Zod (`zod-openapi`) — dos features por el precio de una.

### 4.4 Observabilidad: logging estructurado + error tracking 🟡

- **Qué hace:** `pino` con request-id por petición, Sentry (free tier) en backend y frontend, y logs de las ejecuciones del cron de ingesta (cuántos jobs, cuánto tardó, fallos por país).
- **Por qué encaja:** el proyecto corre en producción real (Render + Vercel) con crons — cuando la ingesta falle a las 3am, hoy nadie se entera. "¿Cómo sabes que tu cron funcionó anoche?" es pregunta de entrevista.
- **Notas de implementación:** tabla `IngestionRun` (`{ startedAt, country, jobsIngested, status, error? }`) además de los logs — barata y consultable desde la API (alimenta el freshness label con más detalle).

### 4.5 Tests E2E con Playwright 🟡

- **Qué hace:** flujos críticos end-to-end: cargar dashboard → filtrar país → ver charts; login mock → editar skills → verificar persistencia.
- **Por qué encaja:** la pirámide de testing actual (unit + integration con MSW) es sólida; E2E la corona. Integrado en la CI de 4.1.

### 4.6 Endurecer auth: CSRF state one-time-use 🟢

- **Qué hace:** guardar el state HMAC en Redis y borrarlo al verificar, como ya describe el propio README ("known limitation… deferred").
- **Por qué encaja:** cerrar una limitación de seguridad autodocumentada. La infraestructura Redis ya existe. Historia perfecta de "deuda registrada → deuda pagada".

### 4.7 Migrar scheduler a BullMQ 🟡 *(solo si Tier 2/3 lo justifican)*

- **Qué hace:** colas Redis para ingesta y emails: reintentos, backoff, visibilidad de jobs fallidos.
- **Por qué encaja:** el README ya lo evaluó y lo difirió con criterio. Se justifica cuando existan 3.1 (multi-fuente) y 2.1 (emails) — más trabajos en background, más valor de una cola real. No hacerlo antes: sería sobre-ingeniería y el README actual lo argumenta bien.

---

## Hoja de ruta sugerida

Si el objetivo es maximizar el efecto portfolio, este orden equilibra quick wins visibles con las features de fondo:

| Versión | Contenido | Racional |
| ------- | --------- | -------- |
| **v0.8** | 1.1 Match Score + 2.2 Skill Gap | Ya planeado; el gap analysis sale casi gratis encima |
| **v0.8.x** | 4.1 CI + 4.2 Zod + cron de snapshots (parte de 1.2) | CI es el gap más visible; los snapshots hay que empezarlos YA aunque la UI llegue después |
| **v0.9** | 1.4 Prima salarial + 1.5 Comparador + 2.4 URL state | Tres quick wins que transforman la demo visualmente |
| **v1.0** | 1.2 Trends UI + 1.3 Skill detail pages + 4.3 OpenAPI | El salto a "producto completo"; buen momento para el hito 1.0 |
| **v1.1** | 2.1 Email digest + 4.4 Observabilidad | Retención + operación seria |
| **v1.2+** | 3.1 Segunda fuente + 3.2 Extractor v2 + 4.7 BullMQ | Profundidad de datos cuando el producto ya luce |

**Regla general:** cada versión debería dejar algo visible en la demo *y* algo defendible en entrevista. Las features de Tier 4 se cuelan de acompañantes en cada release en lugar de hacer un "sprint de deuda técnica" que no luce.
