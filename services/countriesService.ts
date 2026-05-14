import { supabase } from "@/lib/supabase";

export interface Country {
  id: number;
  name: string;
  flag: string;
  currency_code: string;
  currency_name: string;
  continent: string;
  capital?: string;
  population?: number;
  phone_code?: string;
}

export async function getCountriesByContinent(
  continent: string
): Promise<Country[]> {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("continent", continent)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getCountryByCurrency(
  currencyCode: string
): Promise<Country | null> {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("currency_code", currencyCode)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getAllCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}
