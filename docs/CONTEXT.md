# Contexto técnico — currency-converter-app

## Stack y arquitectura

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navegación | Expo Router (file-based) |
| Lenguaje | TypeScript estricto |
| Arquitectura RN | New Architecture (`newArchEnabled: true`) |
| React Compiler | Habilitado en `experiments` |
| Estado | `useState` / `useCallback` / `useEffect` — sin Redux ni Context global |
| Animaciones | `Animated` API de React Native (`useNativeDriver: true`) |

## Estructura de archivos

```
currency-converter-app/
├── app/
│   ├── _layout.tsx          # Stack root — título "Conversor Universal"
│   └── index.tsx            # Pantalla única (toda la UI)
├── components/
│   ├── StocksModal.tsx      # Modal de acciones del mercado local del país
│   └── StocksTicker.tsx     # Ticker horizontal animado (8 acciones globales)
├── lib/
│   └── supabase.ts          # Cliente Supabase (process.env directo)
├── services/
│   ├── api.ts               # fetchExchangeRates — frankfurter.app
│   ├── countriesService.ts  # getCountryByCurrency — Supabase tabla "countries"
│   └── stocksService.ts     # getStockQuote, getMultipleQuotes,
│                            # getStocksSequential, GLOBAL_STOCKS
├── docs/
│   └── CONTEXT.md           # este archivo
├── .env.local               # variables de entorno (gitignoreado)
├── app.json                 # configuración Expo (extra: {} — vacío a propósito)
├── CLAUDE.md                # contexto resumido para Claude Code
└── tsconfig.json
```

## APIs integradas

### frankfurter.app
- **Uso**: tasas de cambio en tiempo real
- **Auth**: ninguna (API pública gratuita)
- **Endpoint**: `GET /latest?from={base}`
- **Variable de entorno**: ninguna
- **Archivo**: `services/api.ts`

### Supabase
- **Uso**: datos de países (nombre, capital, código de teléfono, etc.)
- **Tabla**: `countries` con columnas `name`, `capital`, `currency_code`, `phone_code`, `flag`, `continent`
- **Variables de entorno**:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Archivo**: `lib/supabase.ts`, `services/countriesService.ts`

### Twelve Data
- **Uso**: cotizaciones de acciones (modal por país + ticker global)
- **Plan**: gratuito — 8 créditos/minuto
- **Variable de entorno**: `EXPO_PUBLIC_TWELVE_DATA_KEY`
- **Archivo**: `services/stocksService.ts`
- **Restricción**: las llamadas al ticker usan `getStocksSequential` con 200ms de delay entre cada símbolo para no superar el límite

## Variables de entorno

Todas con prefijo `EXPO_PUBLIC_` para que Expo las inyecte en tiempo de build. Se leen con `process.env.EXPO_PUBLIC_*` directamente — **no** a través de `Constants.expoConfig.extra`, porque `app.json` no interpola variables de entorno (solo acepta valores estáticos).

El campo `extra` de `app.json` está intencionalmente vacío: `"extra": {}`.

El archivo `.env.local` está en `.gitignore` bajo el patrón `.env*.local`.

## Decisiones técnicas

**Selectores de continente independientes por moneda**
Cada selector (origen/destino) tiene su propio estado de continente (`fromContinent`, `toContinent`). Permite convertir entre monedas de distintos continentes. El selector de continente global fue eliminado.

**Caché en memoria para acciones**
`StocksModal` y `StocksTicker` usan variables a nivel de módulo (`let tickerCache`, `const cache = new Map()`) para no repetir llamadas a Twelve Data en la misma sesión. Se reinician al cerrar la app.

**Historial de conversiones en memoria**
Las últimas 5 conversiones se guardan en `useState` — no persiste entre sesiones. Se registra al actualizar tasas o al terminar de escribir el monto (`onEndEditing`).

**Ticker animado con loop infinito**
Dos copias del contenido en un `Animated.View flexDirection: row`. La animación va de `0` a `-contentWidth` y hace loop, creando el efecto continuo. `useNativeDriver: true` mantiene la animación en el hilo nativo.

**Lectura de símbolos en el modal de acciones**
`MARKET_STOCKS` en `StocksModal.tsx` mapea cada código de moneda a dos símbolos bursátiles del mercado local. Para mercados sin cobertura en Twelve Data (FJD, PGK) se usan AAPL/MSFT como fallback.

## TODO — Etapa 5

- [ ] Migrar `services/api.ts` al backend propio (Node.js + Express) cuando esté disponible. Referencia: `currency-converter/src/services/api.js`.
- [ ] Migrar `services/countriesService.ts` y `services/stocksService.ts` al backend propio para centralizar el manejo de API keys y evitar exponerlas en el cliente.
- [ ] Eliminar dependencia directa de Supabase desde el cliente móvil.
- [ ] Implementar persistencia del historial de conversiones (AsyncStorage o backend).
