import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import {
  GLOBAL_STOCKS,
  getStocksSequential,
  StockQuote,
} from "@/services/stocksService";

let tickerCache: StockQuote[] | null = null;

function TickerContent({ stocks }: { stocks: StockQuote[] }) {
  return (
    <>
      {stocks.map((stock, i) => {
        const pct = parseFloat(stock.percent_change);
        const isUp = pct >= 0;
        const price = parseFloat(stock.close).toFixed(2);
        const symbol = stock.symbol.split(":")[0];
        return (
          <React.Fragment key={stock.symbol}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text style={styles.price}> ${price}</Text>
            <Text style={[styles.change, isUp ? styles.up : styles.down]}>
              {" "}
              {isUp ? "▲" : "▼"}
              {Math.abs(pct).toFixed(2)}%
            </Text>
            {i < stocks.length - 1 && (
              <Text style={styles.sep}>{"   |   "}</Text>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default function StocksTicker() {
  const [stocks, setStocks] = useState<StockQuote[]>(tickerCache ?? []);
  const translateX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (tickerCache) {
      setStocks(tickerCache);
      return;
    }
    getStocksSequential(GLOBAL_STOCKS)
      .then((quotes) => {
        tickerCache = quotes;
        setStocks(quotes);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (contentWidth === 0 || stocks.length === 0) return;

    translateX.setValue(0);
    animRef.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration: contentWidth * 15,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animRef.current.start();

    return () => animRef.current?.stop();
  }, [contentWidth, stocks.length]);

  if (stocks.length === 0) return null;

  return (
    <View style={styles.outer}>
      <Animated.View style={[styles.inner, { transform: [{ translateX }] }]}>
        <View
          style={styles.group}
          onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        >
          <TickerContent stocks={stocks} />
        </View>
        <View style={styles.group}>
          <TickerContent stocks={stocks} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "#1E1B4B",
    height: 36,
    overflow: "hidden",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  symbol: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  price: {
    fontSize: 12,
    color: "#C7D2FE",
  },
  change: {
    fontSize: 12,
    fontWeight: "600",
  },
  up: { color: "#34D399" },
  down: { color: "#F87171" },
  sep: {
    fontSize: 12,
    color: "#6366F1",
  },
});
