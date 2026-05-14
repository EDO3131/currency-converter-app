import Constants from "expo-constants";

const TWELVE_DATA_KEY: string =
  Constants.expoConfig?.extra?.twelveDataKey ?? "";
const BASE_URL = "https://api.twelvedata.com";

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
