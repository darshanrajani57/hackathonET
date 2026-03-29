"use client";

import {
  CandlestickSeries,
  createChart,
  HistogramSeries,
  IChartApi,
  UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

import { OhlcvCandle } from "@/lib/types";

export function CandleChart({ data }: { data: OhlcvCandle[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "#0D1117" },
        textColor: "#7A8899",
      },
      grid: {
        vertLines: { color: "#1C2535" },
        horzLines: { color: "#1C2535" },
      },
      rightPriceScale: {
        borderColor: "#253045",
      },
      timeScale: {
        borderColor: "#253045",
      },
    });
    chartRef.current = chart;

    const isV5Api = typeof (chart as any).addSeries === "function";

    const candleSeries = isV5Api
      ? (chart as any).addSeries(CandlestickSeries, {
          upColor: "#00C878",
          downColor: "#FF3B5C",
          borderVisible: false,
          wickUpColor: "#00C878",
          wickDownColor: "#FF3B5C",
        })
      : (chart as any).addCandlestickSeries({
          upColor: "#00C878",
          downColor: "#FF3B5C",
          borderVisible: false,
          wickUpColor: "#00C878",
          wickDownColor: "#FF3B5C",
        });

    const volumeSeries = isV5Api
      ? (chart as any).addSeries(HistogramSeries, {
          color: "#3B8BFF55",
          priceFormat: { type: "volume" },
          priceScaleId: "",
        })
      : (chart as any).addHistogramSeries({
          color: "#3B8BFF55",
          priceFormat: { type: "volume" },
          priceScaleId: "",
        });

    candleSeries.setData(
      data.map((candle) => ({
        time: (new Date(candle.time).getTime() / 1000) as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    );

    volumeSeries.setData(
      data.map((candle) => ({
        time: (new Date(candle.time).getTime() / 1000) as UTCTimestamp,
        value: candle.volume,
        color: candle.close >= candle.open ? "#00C87844" : "#FF3B5C44",
      })),
    );

    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [data]);

  return <div ref={containerRef} className="h-[420px] w-full" />;
}
