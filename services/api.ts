// TODO: migrar a consumir el backend propio (Node.js + Express)
// cuando esté disponible en Etapa 5. Actualmente duplicado
// desde la app web — misma lógica, distinta plataforma.
// Referencia: currency-converter/src/services/api.js

const BASE_URL = "https://api.frankfurter.app";

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function fetchExchangeRates(
  base: string = "USD"
): Promise<ExchangeRates> {
  const response = await fetch(`${BASE_URL}/latest?from=${base}`);
  if (!response.ok) throw new Error("Error al obtener tasas de cambio");
  return response.json();
}

export async function getAvailableCurrencies(): Promise<
  Record<string, string>
> {
  const response = await fetch(`${BASE_URL}/currencies`);
  if (!response.ok) throw new Error("Error al obtener lista de monedas");
  return response.json();
}
