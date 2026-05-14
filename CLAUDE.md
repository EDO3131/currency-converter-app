# currency-converter-app

App móvil React Native con Expo SDK 54. Convertidor de monedas con tasas en tiempo real, historial de conversiones, información de países y ticker de acciones globales.

## Stack

- **Framework**: React Native + Expo SDK 54 (Expo Router, New Architecture)
- **Lenguaje**: TypeScript
- **APIs**: frankfurter.app (tasas), Supabase (países), Twelve Data (acciones)

## Variables de entorno

Definidas en `.env.local` en la raíz — **nunca commitear**.

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_TWELVE_DATA_KEY=
```

Se acceden con `process.env.EXPO_PUBLIC_*` directamente en el código. No usar `Constants.expoConfig.extra` — los valores de `app.json` no interpolan variables de entorno.

## Estructura principal

```
app/index.tsx          — pantalla principal (convertidor + historial + ticker)
app/_layout.tsx        — título "Conversor Universal"
components/
  StocksModal.tsx      — modal de acciones del mercado local
  StocksTicker.tsx     — ticker horizontal animado
lib/supabase.ts        — cliente Supabase
services/
  api.ts               — tasas de cambio (frankfurter.app)
  countriesService.ts  — datos de países (Supabase)
  stocksService.ts     — cotizaciones (Twelve Data)
```

## Ramas

- `main` — producción
- `develop` — desarrollo activo

## Notas

- Twelve Data plan gratuito: 8 créditos/minuto. Las acciones se cargan secuencialmente con 200ms de delay entre requests (`getStocksSequential`).
- Los servicios de acciones y países están duplicados desde la app web (`currency-converter`). Migrar al backend propio en Etapa 5.
