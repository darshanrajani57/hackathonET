"use client";

import { DataTable } from "@/components/shared/DataTable";
import { PortfolioHolding } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function PortfolioTable({ portfolio }: { portfolio: PortfolioHolding[] }) {
  return (
    <DataTable
      data={portfolio}
      columns={[
        { key: "symbol", label: "Symbol" },
        { key: "quantity", label: "Qty" },
        { key: "avgPrice", label: "Avg Price", render: (value) => formatINR(Number(value)) },
        { key: "ltp", label: "LTP", render: (value) => formatINR(Number(value)) },
      ]}
    />
  );
}
