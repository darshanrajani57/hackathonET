import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { getPortfolio } from "@/lib/api";

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();
  return (
    <div className="p-4">
      <h1 className="mb-3 font-display text-lg">Portfolio</h1>
      <PortfolioTable portfolio={portfolio} />
    </div>
  );
}
