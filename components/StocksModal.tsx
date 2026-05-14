import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getMultipleQuotes, StockQuote } from "@/services/stocksService";

const MARKET_STOCKS: Record<string, [string, string]> = {
  USD: ["AAPL", "MSFT"],
  CAD: ["RY:TSX", "TD:TSX"],
  MXN: ["AMXL:BMV", "BIMBOA:BMV"],
  BRL: ["VALE3:BVMF", "PETR4:BVMF"],
  ARS: ["YPF", "GGAL"],
  CLP: ["LTM:SGO", "COPEC:SGO"],
  COP: ["ISA:BVC", "PFBCOLOM:BVC"],
  PEN: ["ALICORC1:LIM", "CPACASC1:LIM"],
  EUR: ["SAP:XETRA", "ASML:XETRA"],
  GBP: ["SHEL:LSE", "HSBA:LSE"],
  CHF: ["NESN:SWX", "ROG:SWX"],
  NOK: ["EQNR:OSL", "DNB:OSL"],
  SEK: ["VOLV B:STO", "ERIC B:STO"],
  DKK: ["NOVO B:CPH", "DSV:CPH"],
  PLN: ["PKN:WSE", "KGH:WSE"],
  CZK: ["CEZ:PSE", "KB:PSE"],
  HUF: ["OTP:BUD", "MOL:BUD"],
  RON: ["TLV:BVB", "SNG:BVB"],
  JPY: ["7203:TSE", "6758:TSE"],
  CNY: ["600519:SHG", "601318:SHG"],
  INR: ["RELIANCE:NSE", "TCS:NSE"],
  KRW: ["005930:KRX", "000660:KRX"],
  SGD: ["D05:SGX", "U11:SGX"],
  HKD: ["0700:HKEX", "0005:HKEX"],
  THB: ["PTT:SET", "SCB:SET"],
  MYR: ["MAYBANK:KLSE", "PBBANK:KLSE"],
  IDR: ["BBCA:IDX", "TLKM:IDX"],
  PHP: ["SM:PSE", "BDO:PSE"],
  ZAR: ["NPN:JSE", "SOL:JSE"],
  EGP: ["COMI:CASE", "HRHO:CASE"],
  NGN: ["DANGCEM:NGX", "ZENITHBANK:NGX"],
  KES: ["SCOM:NSE_KE", "EABL:NSE_KE"],
  MAD: ["ATW:CSE", "IAM:CSE"],
  GHS: ["MTN:GSE", "GCB:GSE"],
  AUD: ["CBA:ASX", "BHP:ASX"],
  NZD: ["ANZ:NZX", "CEN:NZX"],
  FJD: ["AAPL", "MSFT"],
  PGK: ["AAPL", "MSFT"],
};

function formatVolume(vol: string): string {
  const n = parseInt(vol, 10);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

const cache = new Map<string, StockQuote[]>();

interface Props {
  visible: boolean;
  onClose: () => void;
  currencyCode: string;
  flag: string;
  countryName: string;
}

export default function StocksModal({
  visible,
  onClose,
  currencyCode,
  flag,
  countryName,
}: Props) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const symbols = MARKET_STOCKS[currencyCode];
    if (!symbols) {
      setError("Mercado no disponible para esta moneda.");
      return;
    }

    if (cache.has(currencyCode)) {
      setStocks(cache.get(currencyCode)!);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStocks([]);

    getMultipleQuotes(Array.from(symbols))
      .then((data) => {
        const quotes = Object.values(data).filter(
          (q): q is StockQuote => typeof q === "object" && "close" in q
        );
        if (quotes.length === 0)
          throw new Error("Sin datos disponibles para este mercado.");
        cache.set(currencyCode, quotes);
        setStocks(quotes);
      })
      .catch((e: Error) =>
        setError(e.message || "Error al cargar cotizaciones.")
      )
      .finally(() => setLoading(false));
  }, [visible, currencyCode]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerFlag}>{flag}</Text>
              <Text style={styles.headerTitle}>{countryName}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Principales acciones del mercado</Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#4F46E5" size="large" />
              <Text style={styles.loadingText}>Cargando cotizaciones…</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.stocksList}>
              {stocks.map((stock) => {
                const pct = parseFloat(stock.percent_change);
                const isPositive = pct >= 0;
                const price = parseFloat(stock.close).toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                return (
                  <View key={stock.symbol} style={styles.stockCard}>
                    <View style={styles.stockLeft}>
                      <Text style={styles.stockSymbol}>
                        {stock.symbol.split(":")[0]}
                      </Text>
                      <Text style={styles.stockName} numberOfLines={1}>
                        {stock.name || stock.symbol}
                      </Text>
                    </View>
                    <View style={styles.stockRight}>
                      <Text style={styles.stockPrice}>
                        {stock.currency} {price}
                      </Text>
                      <Text
                        style={[
                          styles.stockChange,
                          isPositive ? styles.positive : styles.negative,
                        ]}
                      >
                        {isPositive ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
                      </Text>
                      <Text style={styles.stockVolume}>
                        Vol: {formatVolume(stock.volume)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    minHeight: 300,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerFlag: { fontSize: 28 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeBtn: {
    fontSize: 20,
    color: "rgba(255,255,255,0.8)",
    paddingHorizontal: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  center: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
  },
  stocksList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  stockCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stockLeft: {
    flex: 1,
    marginRight: 12,
  },
  stockSymbol: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  stockName: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  stockRight: {
    alignItems: "flex-end",
    gap: 3,
  },
  stockPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  stockChange: {
    fontSize: 13,
    fontWeight: "600",
  },
  positive: { color: "#059669" },
  negative: { color: "#DC2626" },
  stockVolume: {
    fontSize: 11,
    color: "#9CA3AF",
  },
});
