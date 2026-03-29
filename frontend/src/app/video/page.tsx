export default function VideoPage() {
  return (
    <div className="p-4">
      <h1 className="mb-3 font-display text-lg">Video Engine Status</h1>
      <div className="panel p-3 text-sm text-[var(--text-data)]">
        <p>Pipeline: Live</p>
        <p>Current stream: NSE Morning Pulse</p>
        <p>Frame infer latency: 84ms</p>
        <p>Queue depth: 3 jobs</p>
      </div>
    </div>
  );
}
