const TWELVE_DATA_KEY = process.env.EXPO_PUBLIC_TWELVE_DATA_KEY ?? "";
const BASE_URL = "https://api.twelvedata.com";

export const GLOBAL_STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN",
  "TSLA", "META", "NVDA", "JPM",
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getStocksSequential(
  symbols: string[],
  delayMs = 200
): Promise<StockQuote[]> {
  const results: StockQuote[] = [];
  for (let i = 0; i < symbols.length; i++) {
    if (i > 0) await sleep(delayMs);
    try {
      const quote = await getStockQuote(symbols[i]);
      results.push(quote);
    } catch {
      // símbolo no disponible — continúa con el siguiente
    }
  }
  return results;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  change: string;
  percent_change: string;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const response = await fetch(
    `${BASE_URL}/quote?symbol=${symbol}&apikey=${TWELVE_DATA_KEY}`
  );
  if (!response.ok) throw new Error("Error al obtener cotización");
  const data = await response.json();
  if (data.status === "error") throw new Error(data.message);
  return data;
}

export async function getMultipleQuotes(
  symbols: string[]
): Promise<Record<string, StockQuote>> {
  const symbolList = symbols.join(",");
  const response = await fetch(
    `${BASE_URL}/quote?symbol=${symbolList}&apikey=${TWELVE_DATA_KEY}`
  );
  if (!response.ok) throw new Error("Error al obtener cotizaciones");
  return response.json();
}
