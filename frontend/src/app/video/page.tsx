"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import { DataTable } from "@/components/shared/DataTable";
import { NeonButton } from "@/components/shared/NeonButton";
import { generateVideoJob } from "@/lib/api";
import { initialVideoJobs, mockVideoTemplates, VideoJob, VideoTemplateType } from "@/lib/mock/video-engine";

const templateLabel: Record<VideoTemplateType, string> = {
  DAILY_WRAP: "Daily Wrap",
  RACE_CHART: "Race Chart",
  SECTOR_ROTATION: "Sector Rotation",
  FII_DII_FLOW: "FII / DII Flow",
  IPO_TRACKER: "IPO Tracker",
};

function statusTone(status: VideoJob["status"]) {
  if (status === "completed") return "text-[var(--accent-green)] border-[var(--accent-green-dim)] bg-[var(--accent-green-dim)]";
  if (status === "failed") return "text-[var(--accent-red)] border-[var(--accent-red-dim)] bg-[var(--accent-red-dim)]";
  if (status === "rendering") return "text-[var(--accent-blue)] border-[var(--accent-blue-dim)] bg-[var(--accent-blue-dim)]";
  return "text-[var(--accent-amber)] border-[var(--accent-amber-dim)] bg-[var(--accent-amber-dim)]";
}

function scenePreview(type: VideoTemplateType) {
  switch (type) {
    case "RACE_CHART":
      return ["NIFTY/BANK/IT race timeline", "Momentum leader swaps", "Narrated winner summary"];
    case "SECTOR_ROTATION":
      return ["Sector heat-map transition", "Capital rotation arrows", "Alpha pockets highlight"];
    case "FII_DII_FLOW":
      return ["FII vs DII cumulative bars", "Intraday pressure zones", "Index impact annotation"];
    case "IPO_TRACKER":
      return ["Subscription curve animation", "GMP drift panel", "Listing score projection"];
    case "DAILY_WRAP":
    default:
      return ["Index open-close spread", "Top movers montage", "Close outlook voice-over"];
  }
}

export default function VideoPage() {
  const [jobs, setJobs] = useState<VideoJob[]>(initialVideoJobs);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(initialVideoJobs[0].id);
  const [pipelineLive, setPipelineLive] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const sequenceRef = useRef(1183);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? jobs[0], [jobs, selectedJobId]);
  const selectedOutputUrl = selectedJob?.outputUrl && selectedJob.outputUrl !== "#" ? selectedJob.outputUrl : undefined;
  const queueDepth = useMemo(() => jobs.filter((job) => job.status === "queued" || job.status === "rendering").length, [jobs]);
  const activeLatency = selectedJob?.frameLatencyMs ?? 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setJobs((previous) => {
        let next = previous.map((job) => ({ ...job }));

        const active = next.find((job) => job.status === "rendering");
        if (active) {
          active.progress = Math.min(100, active.progress + 8 + Math.floor(Math.random() * 10));
          active.frameLatencyMs = 72 + Math.floor(Math.random() * 28);
          if (active.progress >= 100) {
            active.status = "completed";
            active.outputUrl = undefined;
          }
        }

        if (!next.some((job) => job.status === "rendering")) {
          const queued = next.find((job) => job.status === "queued");
          if (queued) {
            queued.status = "rendering";
            queued.progress = Math.max(queued.progress, 6);
            queued.frameLatencyMs = 80;
          }
        }

        if (autoGenerate && next.filter((job) => job.status === "queued").length < 2) {
          const template = mockVideoTemplates[Math.floor(Math.random() * mockVideoTemplates.length)];
          const id = `JOB-${sequenceRef.current++}`;
          const newJob: VideoJob = {
            id,
            title: `${templateLabel[template.type]} Auto-run`,
            templateType: template.type,
            status: "queued",
            progress: 0,
            durationSec: template.targetDurationSec,
            frameLatencyMs: 0,
            createdAt: "Just now",
          };
          next = [
            newJob,
            ...next,
          ].slice(0, 10);
        }

        return next;
      });
    }, 2200);

    return () => clearInterval(timer);
  }, [autoGenerate]);

  const generateMutation = useMutation({
    mutationFn: generateVideoJob,
    onSuccess: (generated, variables) => {
      if (generated.status === "failed") {
        setGenerationError(generated.error ?? "Stock-market video output is unavailable.");
      } else {
        setGenerationError(null);
      }
      const targetId = variables.clientJobId;
      setJobs((previous) =>
        previous.map((job) =>
          job.id === targetId
            ? {
                ...job,
                ...generated,
                id: targetId ?? generated.id,
              }
            : job,
        ),
      );
    },
    onError: (error, variables) => {
      setGenerationError(error instanceof Error ? error.message : "Video generation failed.");
      const targetId = variables.clientJobId;
      setJobs((previous) =>
        previous.map((job) =>
          job.id === targetId
            ? {
                ...job,
                status: "failed",
                progress: 0,
              }
            : job,
        ),
      );
    },
  });

  const enqueueNow = () => {
    const template = mockVideoTemplates[Math.floor(Math.random() * mockVideoTemplates.length)];
    const id = `JOB-${sequenceRef.current++}`;
    const newJob: VideoJob = {
      id,
      title: `${templateLabel[template.type]} Manual Trigger`,
      templateType: template.type,
      status: "rendering",
      progress: 12,
      durationSec: template.targetDurationSec,
      frameLatencyMs: 0,
      createdAt: "Just now",
    };
    setJobs((previous) => [
      newJob,
      ...previous,
    ].slice(0, 10));
    setSelectedJobId(id);

    generateMutation.mutate({
      clientJobId: id,
      title: newJob.title,
      templateType: template.type,
      durationSec: newJob.durationSec,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <header className="panel flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="font-display text-lg">AI Market Video Engine</h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Auto-generates 30–90 sec market videos from live data with zero manual editing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NeonButton variant="ghost" onClick={() => setPipelineLive((value) => !value)}>
            Pipeline: {pipelineLive ? "LIVE" : "PAUSED"}
          </NeonButton>
          <NeonButton variant="primary" onClick={enqueueNow}>
            Generate Now
          </NeonButton>
        </div>
      </header>

      {generationError ? (
        <div className="panel border border-[var(--accent-red-dim)] bg-[var(--accent-red-dim)] px-3 py-2 text-xs text-[var(--accent-red)]">
          Video generation error: {generationError}
        </div>
      ) : null}

      <section className="grid grid-cols-4 gap-3">
        <div className="panel p-3">
          <p className="text-[10px] uppercase text-[var(--text-secondary)]">Queue Depth</p>
          <p className="mt-2 font-display text-xl text-[var(--text-primary)]">{queueDepth} jobs</p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] uppercase text-[var(--text-secondary)]">Frame Latency</p>
          <p className="mt-2 font-display text-xl text-[var(--text-primary)]">{activeLatency}ms</p>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] uppercase text-[var(--text-secondary)]">Auto Generation</p>
          <button
            onClick={() => setAutoGenerate((value) => !value)}
            className={`mt-2 rounded border px-2 py-1 text-xs ${
              autoGenerate
                ? "border-[var(--accent-green-dim)] text-[var(--accent-green)]"
                : "border-[var(--border-dim)] text-[var(--text-secondary)]"
            }`}
          >
            {autoGenerate ? "ON" : "OFF"}
          </button>
        </div>
        <div className="panel p-3">
          <p className="text-[10px] uppercase text-[var(--text-secondary)]">Target Duration</p>
          <p className="mt-2 font-display text-xl text-[var(--text-primary)]">30–90 sec</p>
        </div>
      </section>

      <section className="panel p-3">
        <h2 className="mb-2 text-xs uppercase text-[var(--text-secondary)]">Templates Enabled</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {mockVideoTemplates.map((template) => (
            <span key={template.id} className="rounded border border-[var(--border-dim)] bg-[var(--bg-elevated)] px-2 py-1 text-[var(--text-data)]">
              {template.name}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="panel p-3">
          <h2 className="mb-3 text-xs uppercase text-[var(--text-secondary)]">Render Queue</h2>
          <DataTable
            data={jobs}
            columns={[
              { key: "id", label: "Job" },
              {
                key: "templateType",
                label: "Template",
                render: (value) => <span>{templateLabel[value as VideoTemplateType]}</span>,
              },
              {
                key: "status",
                label: "Status",
                render: (value) => (
                  <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] uppercase ${statusTone(value as VideoJob["status"])}`}>
                    {String(value)}
                  </span>
                ),
              },
              {
                key: "progress",
                label: "Progress",
                render: (value) => {
                  const numeric = Number(value);
                  return (
                    <div className="w-[120px]">
                      <div className="h-1.5 overflow-hidden rounded bg-[var(--border-dim)]">
                        <div className="h-full bg-[var(--accent-blue)]" style={{ width: `${numeric}%` }} />
                      </div>
                      <span className="mt-1 inline-block text-[10px] text-[var(--text-secondary)]">{numeric}%</span>
                    </div>
                  );
                },
              },
            ]}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`rounded border px-2 py-1 text-[10px] ${
                  job.id === selectedJobId
                    ? "border-[var(--accent-blue)] text-[var(--accent-blue)]"
                    : "border-[var(--border-dim)] text-[var(--text-secondary)]"
                }`}
              >
                {job.id}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-3">
            <h2 className="text-xs uppercase text-[var(--text-secondary)]">Video Output</h2>
            {selectedOutputUrl ? (
              <video key={selectedOutputUrl} controls className="mt-2 w-full rounded border border-[var(--border-dim)] bg-black">
                <source src={selectedOutputUrl} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                No playable video file is attached to this job yet. Queue/progress is visible, but users can only watch once the engine returns a real output URL.
              </p>
            )}
          </div>

          <div className="panel p-3">
            <h2 className="text-xs uppercase text-[var(--text-secondary)]">Storyboard Preview</h2>
            {selectedJob ? (
              <>
                <p className="mt-2 text-sm text-[var(--text-primary)]">{selectedJob.title}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {templateLabel[selectedJob.templateType]} • {selectedJob.durationSec}s • {selectedJob.createdAt}
                </p>

                <div className="mt-3 space-y-2">
                  {scenePreview(selectedJob.templateType).map((scene, index) => (
                    <div key={scene} className="rounded border border-[var(--border-dim)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs text-[var(--text-data)]">
                      Scene {index + 1}: {scene}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-[var(--text-secondary)]">No job selected.</p>
            )}
          </div>

          <div className="panel p-3">
            <h2 className="text-xs uppercase text-[var(--text-secondary)]">Recent Outputs</h2>
            <div className="mt-2 space-y-2 text-xs">
              {jobs
                .filter((job) => job.status === "completed")
                .slice(0, 3)
                .map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded border border-[var(--border-dim)] bg-[var(--bg-elevated)] px-2 py-1.5">
                    <span className="text-[var(--text-data)]">{job.title}</span>
                    {job.outputUrl && job.outputUrl !== "#" ? (
                      <a href={job.outputUrl} className="text-[var(--accent-blue)]" target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    ) : (
                      <span className="text-[var(--text-secondary)]">Pending file</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
