import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from "react-native";
import { fetchExchangeRates } from "@/services/api";
import { getCountryByCurrency, Country } from "@/services/countriesService";
import StocksModal from "@/components/StocksModal";
import StocksTicker from "@/components/StocksTicker";

type Continent = "América" | "Europa" | "Asia" | "África" | "Oceanía";
type PickerTarget = "from" | "to" | null;

interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  country: string;
  capital: string;
}

interface ConversionRecord {
  fromAmount: string;
  fromFlag: string;
  fromCode: string;
  fromSymbol: string;
  toAmount: string;
  toFlag: string;
  toCode: string;
  toSymbol: string;
  time: string;
}

const CURRENCIES: Record<Continent, CurrencyInfo[]> = {
  América: [
    {
      code: "USD",
      name: "Dólar estadounidense",
      flag: "🇺🇸",
      country: "Estados Unidos",
      capital: "Washington D.C.",
    },
    {
      code: "CAD",
      name: "Dólar canadiense",
      flag: "🇨🇦",
      country: "Canadá",
      capital: "Ottawa",
    },
    {
      code: "MXN",
      name: "Peso mexicano",
      flag: "🇲🇽",
      country: "México",
      capital: "Ciudad de México",
    },
    {
      code: "BRL",
      name: "Real brasileño",
      flag: "🇧🇷",
      country: "Brasil",
      capital: "Brasilia",
    },
    {
      code: "ARS",
      name: "Peso argentino",
      flag: "🇦🇷",
      country: "Argentina",
      capital: "Buenos Aires",
    },
    {
      code: "CLP",
      name: "Peso chileno",
      flag: "🇨🇱",
      country: "Chile",
      capital: "Santiago",
    },
    {
      code: "COP",
      name: "Peso colombiano",
      flag: "🇨🇴",
      country: "Colombia",
      capital: "Bogotá",
    },
    {
      code: "PEN",
      name: "Sol peruano",
      flag: "🇵🇪",
      country: "Perú",
      capital: "Lima",
    },
  ],
  Europa: [
    {
      code: "EUR",
      name: "Euro",
      flag: "🇪🇺",
      country: "Eurozona",
      capital: "Bruselas",
    },
    {
      code: "GBP",
      name: "Libra esterlina",
      flag: "🇬🇧",
      country: "Reino Unido",
      capital: "Londres",
    },
    {
      code: "CHF",
      name: "Franco suizo",
      flag: "🇨🇭",
      country: "Suiza",
      capital: "Berna",
    },
    {
      code: "NOK",
      name: "Corona noruega",
      flag: "🇳🇴",
      country: "Noruega",
      capital: "Oslo",
    },
    {
      code: "SEK",
      name: "Corona sueca",
      flag: "🇸🇪",
      country: "Suecia",
      capital: "Estocolmo",
    },
    {
      code: "DKK",
      name: "Corona danesa",
      flag: "🇩🇰",
      country: "Dinamarca",
      capital: "Copenhague",
    },
    {
      code: "PLN",
      name: "Esloti polaco",
      flag: "🇵🇱",
      country: "Polonia",
      capital: "Varsovia",
    },
    {
      code: "CZK",
      name: "Corona checa",
      flag: "🇨🇿",
      country: "Rep. Checa",
      capital: "Praga",
    },
    {
      code: "HUF",
      name: "Forinto húngaro",
      flag: "🇭🇺",
      country: "Hungría",
      capital: "Budapest",
    },
    {
      code: "RON",
      name: "Leu rumano",
      flag: "🇷🇴",
      country: "Rumanía",
      capital: "Bucarest",
    },
  ],
  Asia: [
    {
      code: "JPY",
      name: "Yen japonés",
      flag: "🇯🇵",
      country: "Japón",
      capital: "Tokio",
    },
    {
      code: "CNY",
      name: "Yuan chino",
      flag: "🇨🇳",
      country: "China",
      capital: "Pekín",
    },
    {
      code: "INR",
      name: "Rupia india",
      flag: "🇮🇳",
      country: "India",
      capital: "Nueva Delhi",
    },
    {
      code: "KRW",
      name: "Won surcoreano",
      flag: "🇰🇷",
      country: "Corea del Sur",
      capital: "Seúl",
    },
    {
      code: "SGD",
      name: "Dólar de Singapur",
      flag: "🇸🇬",
      country: "Singapur",
      capital: "Singapur",
    },
    {
      code: "HKD",
      name: "Dólar de Hong Kong",
      flag: "🇭🇰",
      country: "Hong Kong",
      capital: "Hong Kong",
    },
    {
      code: "THB",
      name: "Baht tailandés",
      flag: "🇹🇭",
      country: "Tailandia",
      capital: "Bangkok",
    },
    {
      code: "MYR",
      name: "Ringgit malayo",
      flag: "🇲🇾",
      country: "Malasia",
      capital: "Kuala Lumpur",
    },
    {
      code: "IDR",
      name: "Rupia indonesia",
      flag: "🇮🇩",
      country: "Indonesia",
      capital: "Yakarta",
    },
    {
      code: "PHP",
      name: "Peso filipino",
      flag: "🇵🇭",
      country: "Filipinas",
      capital: "Manila",
    },
  ],
  África: [
    {
      code: "ZAR",
      name: "Rand sudafricano",
      flag: "🇿🇦",
      country: "Sudáfrica",
      capital: "Pretoria",
    },
    {
      code: "EGP",
      name: "Libra egipcia",
      flag: "🇪🇬",
      country: "Egipto",
      capital: "El Cairo",
    },
    {
      code: "NGN",
      name: "Naira nigeriana",
      flag: "🇳🇬",
      country: "Nigeria",
      capital: "Abuya",
    },
    {
      code: "KES",
      name: "Chelín keniano",
      flag: "🇰🇪",
      country: "Kenia",
      capital: "Nairobi",
    },
    {
      code: "MAD",
      name: "Dírham marroquí",
      flag: "🇲🇦",
      country: "Marruecos",
      capital: "Rabat",
    },
    {
      code: "GHS",
      name: "Cedi ghanés",
      flag: "🇬🇭",
      country: "Ghana",
      capital: "Acra",
    },
  ],
  Oceanía: [
    {
      code: "AUD",
      name: "Dólar australiano",
      flag: "🇦🇺",
      country: "Australia",
      capital: "Canberra",
    },
    {
      code: "NZD",
      name: "Dólar neozelandés",
      flag: "🇳🇿",
      country: "Nueva Zelanda",
      capital: "Wellington",
    },
    {
      code: "FJD",
      name: "Dólar fiyiano",
      flag: "🇫🇯",
      country: "Fiyi",
      capital: "Suva",
    },
    {
      code: "PGK",
      name: "Kina de Papúa",
      flag: "🇵🇬",
      country: "Papúa N. Guinea",
      capital: "Port Moresby",
    },
  ],
};

const CONTINENTS: Continent[] = [
  "América",
  "Europa",
  "Asia",
  "África",
  "Oceanía",
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",   CAD: "CA$", MXN: "$",   BRL: "R$",  ARS: "$",   CLP: "$",
  COP: "$",   PEN: "S/",  EUR: "€",   GBP: "£",   CHF: "Fr",  NOK: "kr",
  SEK: "kr",  DKK: "kr",  PLN: "zł",  CZK: "Kč",  HUF: "Ft",  RON: "lei",
  JPY: "¥",   CNY: "¥",   INR: "₹",   KRW: "₩",   SGD: "S$",  HKD: "HK$",
  THB: "฿",   MYR: "RM",  IDR: "Rp",  PHP: "₱",   ZAR: "R",   EGP: "£",
  NGN: "₦",   KES: "KSh", MAD: "د.م.",GHS: "₵",   AUD: "A$",  NZD: "NZ$",
  FJD: "FJ$", PGK: "K",
};

export default function Index() {
  const [fromContinent, setFromContinent] = useState<Continent>("América");
  const [toContinent, setToContinent] = useState<Continent>("Europa");
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(
    CURRENCIES.América[0]
  );
  const [toCurrency, setToCurrency] = useState<CurrencyInfo>(
    CURRENCIES.Europa[0]
  );
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [ratesDate, setRatesDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);
  const [dbCountry, setDbCountry] = useState<Country | null>(null);
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [stocksVisible, setStocksVisible] = useState(false);

  const buildRecord = useCallback(
    (freshRates: Record<string, number>): ConversionRecord | null => {
      const num = parseFloat(amount);
      const rate = freshRates[toCurrency.code];
      if (isNaN(num) || num < 0 || !rate) return null;
      const fmt = (n: number) =>
        n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
      const time = new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        fromAmount: fmt(num),
        fromFlag: fromCurrency.flag,
        fromCode: fromCurrency.code,
        fromSymbol: CURRENCY_SYMBOLS[fromCurrency.code] ?? fromCurrency.code,
        toAmount: fmt(num * rate),
        toFlag: toCurrency.flag,
        toCode: toCurrency.code,
        toSymbol: CURRENCY_SYMBOLS[toCurrency.code] ?? toCurrency.code,
        time,
      };
    },
    [amount, fromCurrency, toCurrency]
  );

  const pushToHistory = useCallback(
    (record: ConversionRecord) =>
      setHistory((prev) => [record, ...prev].slice(0, 5)),
    []
  );

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExchangeRates(fromCurrency.code);
      setRates(data.rates);
      setRatesDate(data.date);
      const record = buildRecord(data.rates);
      if (record) pushToHistory(record);
    } catch {
      setError("No se pudieron cargar las tasas. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  }, [fromCurrency.code, buildRecord, pushToHistory]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  useEffect(() => {
    getCountryByCurrency(fromCurrency.code)
      .then(setDbCountry)
      .catch(() => setDbCountry(null));
  }, [fromCurrency.code]);

  const handlePickerSelect = (currency: CurrencyInfo) => {
    if (activePicker === "from") setFromCurrency(currency);
    else setToCurrency(currency);
    setActivePicker(null);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getConvertedAmount = (): string => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) return "—";
    const rate = rates[toCurrency.code];
    if (!rate) return "No disponible";
    return (num * rate).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const handleAmountSubmit = () => {
    const record = buildRecord(rates);
    if (record) pushToHistory(record);
  };

  const getRate = (): string => {
    const rate = rates[toCurrency.code];
    if (!rate) return "—";
    return rate.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  };

  const renderCurrencyItem: ListRenderItem<CurrencyInfo> = ({ item }) => (
    <TouchableOpacity
      style={styles.currencyItem}
      onPress={() => handlePickerSelect(item)}
    >
      <Text style={styles.currencyItemFlag}>{item.flag}</Text>
      <View style={styles.currencyItemInfo}>
        <Text style={styles.currencyItemCode}>{item.code}</Text>
        <Text style={styles.currencyItemName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Convertidor de Monedas</Text>
            {ratesDate ? (
              <Text style={styles.headerSubtitle}>Tasas al {ratesDate}</Text>
            ) : null}
          </View>
          <StocksTicker />

          {/* ── Tarjeta convertidor ── */}
          <View style={styles.card}>
            {/* Moneda origen */}
            <Text style={styles.fieldLabel}>De</Text>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setActivePicker("from")}
            >
              <Text style={styles.currencySelectorFlag}>
                {fromCurrency.flag}
              </Text>
              <View style={styles.currencySelectorInfo}>
                <Text style={styles.currencySelectorCode}>
                  {fromCurrency.code}
                </Text>
                <Text style={styles.currencySelectorName}>
                  {fromCurrency.name}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Input de monto */}
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                onEndEditing={handleAmountSubmit}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                returnKeyType="done"
              />
              <Text style={styles.amountCurrencyLabel}>{fromCurrency.code}</Text>
            </View>

            {/* Botón intercambiar */}
            <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
              <Text style={styles.swapButtonText}>⇅</Text>
            </TouchableOpacity>

            {/* Moneda destino */}
            <Text style={styles.fieldLabel}>A</Text>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setActivePicker("to")}
            >
              <Text style={styles.currencySelectorFlag}>{toCurrency.flag}</Text>
              <View style={styles.currencySelectorInfo}>
                <Text style={styles.currencySelectorCode}>
                  {toCurrency.code}
                </Text>
                <Text style={styles.currencySelectorName}>
                  {toCurrency.name}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Resultado */}
            <View style={styles.resultContainer}>
              {loading ? (
                <ActivityIndicator color="#4F46E5" size="large" />
              ) : (
                <>
                  <Text style={styles.resultLabel}>Resultado</Text>
                  <Text style={styles.resultAmount}>
                    {getConvertedAmount()} {toCurrency.code}
                  </Text>
                  <Text style={styles.resultRate}>
                    1 {fromCurrency.code} = {getRate()} {toCurrency.code}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* ── Botón actualizar ── */}
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={loadRates}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>↻  Actualizar tasas</Text>
            )}
          </TouchableOpacity>

          {/* ── Historial ── */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Conversiones recientes</Text>
            {history.length === 0 ? (
              <Text style={styles.historyEmpty}>Sin conversiones recientes</Text>
            ) : (
              history.map((rec, i) => (
                <View
                  key={i}
                  style={[styles.historyRow, i < history.length - 1 && styles.historyRowBorder]}
                >
                  <View style={styles.historyMain}>
                    <Text style={styles.historyFrom}>
                      {rec.fromFlag}{"  "}{rec.fromSymbol}{rec.fromAmount} {rec.fromCode}
                    </Text>
                    <Text style={styles.historyArrow}>→</Text>
                    <Text style={styles.historyTo}>
                      {rec.toFlag}{"  "}{rec.toSymbol}{rec.toAmount} {rec.toCode}
                    </Text>
                  </View>
                  <Text style={styles.historyTime}>{rec.time}</Text>
                </View>
              ))
            )}
          </View>

          {/* ── Error ── */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Card informativa del país ── */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Información del país</Text>
            <View style={styles.countryInfo}>
              <Text style={styles.countryFlag}>{fromCurrency.flag}</Text>
              <View style={styles.countryDetails}>
                <Text style={styles.countryName}>
                  {dbCountry?.name ?? fromCurrency.country}
                </Text>
                <Text style={styles.countryDetail}>
                  Capital:{" "}
                  {dbCountry?.capital ?? fromCurrency.capital ?? "—"}
                </Text>
                <Text style={styles.countryDetail}>
                  Moneda: {fromCurrency.name}
                </Text>
                <Text style={styles.countryDetail}>
                  Código: {fromCurrency.code}
                </Text>
                {dbCountry?.phone_code ? (
                  <Text style={styles.countryDetail}>
                    Tel: +{dbCountry.phone_code}
                  </Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              style={styles.marketButton}
              onPress={() => setStocksVisible(true)}
            >
              <Text style={styles.marketButtonText}>📈  Ver mercado</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StocksModal
        visible={stocksVisible}
        onClose={() => setStocksVisible(false)}
        currencyCode={fromCurrency.code}
        flag={fromCurrency.flag}
        countryName={dbCountry?.name ?? fromCurrency.country}
      />

      {/* ── Modal selector de moneda ── */}
      <Modal
        visible={activePicker !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setActivePicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === "from"
                  ? "Moneda de origen"
                  : "Moneda de destino"}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.modalContinentScroll}
              contentContainerStyle={styles.modalContinentContent}
            >
              {CONTINENTS.map((c) => {
                const active =
                  activePicker === "from"
                    ? fromContinent === c
                    : toContinent === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.continentChip,
                      active && styles.continentChipActive,
                    ]}
                    onPress={() =>
                      activePicker === "from"
                        ? setFromContinent(c)
                        : setToContinent(c)
                    }
                  >
                    <Text
                      style={[
                        styles.continentChipText,
                        active && styles.continentChipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <FlatList
              data={
                CURRENCIES[
                  activePicker === "from" ? fromContinent : toContinent
                ]
              }
              keyExtractor={(item) => item.code}
              renderItem={renderCurrencyItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#C7D2FE",
    marginTop: 4,
  },

  // Secciones
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },

  // Chips de continente
  continentScroll: { flexDirection: "row" },
  continentChip: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    minHeight: 36,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
  },
  continentChipActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  continentChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  continentChipTextActive: {
    color: "#FFFFFF",
  },

  // Tarjeta
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  // Campo label
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },

  // Selector de moneda
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  currencySelectorFlag: { fontSize: 28, marginRight: 12 },
  currencySelectorInfo: { flex: 1 },
  currencySelectorCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  currencySelectorName: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  chevron: { fontSize: 22, color: "#9CA3AF" },

  // Input de monto
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 14,
  },
  amountCurrencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },

  // Botón intercambiar
  swapButton: {
    alignSelf: "center",
    backgroundColor: "#EEF2FF",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: "#C7D2FE",
  },
  swapButtonText: {
    fontSize: 20,
    color: "#4F46E5",
    fontWeight: "600",
  },

  // Resultado
  resultContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    minHeight: 90,
    justifyContent: "center",
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  resultAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#065F46",
    letterSpacing: -0.5,
  },
  resultRate: {
    fontSize: 12,
    color: "#059669",
    marginTop: 6,
  },

  // Botón actualizar
  updateButton: {
    backgroundColor: "#4F46E5",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonDisabled: { opacity: 0.6 },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Error
  errorContainer: {
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },

  // Historial
  historyEmpty: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 16,
  },
  historyRow: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  historyMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  historyFrom: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  historyArrow: {
    fontSize: 13,
    color: "#9CA3AF",
    marginHorizontal: 4,
  },
  historyTo: {
    fontSize: 13,
    color: "#4F46E5",
    fontWeight: "600",
  },
  historyTime: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  // Botón mercado
  marketButton: {
    marginTop: 16,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C7D2FE",
  },
  marketButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4F46E5",
  },

  // Card país
  countryInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  countryFlag: { fontSize: 50, marginRight: 16 },
  countryDetails: { flex: 1 },
  countryName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  countryDetail: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 3,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalClose: {
    fontSize: 20,
    color: "#9CA3AF",
    paddingHorizontal: 4,
  },
  modalContinentScroll: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalContinentContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  currencyItemFlag: { fontSize: 28, marginRight: 14 },
  currencyItemInfo: { flex: 1 },
  currencyItemCode: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  currencyItemName: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 62,
  },
});
