const sectors = [
  { name: "BANK", move: 1.21 },
  { name: "IT", move: -0.92 },
  { name: "AUTO", move: 0.67 },
  { name: "FMCG", move: -0.21 },
  { name: "METAL", move: 1.78 },
  { name: "PHARMA", move: 0.44 },
  { name: "REALTY", move: -1.02 },
  { name: "PSU", move: 1.39 },
  { name: "ENERGY", move: 0.84 },
  { name: "MEDIA", move: -0.57 },
  { name: "INFRA", move: 0.49 },
  { name: "CHEM", move: -0.14 },
];

export function HeatMap() {
  return (
    <section className="panel p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--text-secondary)]">Sector Heatmap</h3>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        {sectors.map((sector) => {
          const positive = sector.move >= 0;
          return (
            <div
              key={sector.name}
              className="rounded-md border border-[var(--border-dim)] p-2"
              style={{
                background: positive
                  ? `rgba(0, 255, 163, ${Math.min(Math.abs(sector.move), 2) / 6})`
                  : `rgba(255, 69, 96, ${Math.min(Math.abs(sector.move), 2) / 6})`,
              }}
            >
              <p className="font-medium text-[var(--text-primary)]">{sector.name}</p>
              <p className={positive ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}>
                {sector.move > 0 ? "+" : ""}
                {sector.move.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
