import { NextRequest, NextResponse } from "next/server";

import { VideoTemplateType } from "@/lib/mock/video-engine";

type GenerateVideoPayload = {
  templateType?: VideoTemplateType;
  title?: string;
  durationSec?: number;
  clientJobId?: string;
};

const DEFAULT_DUMMY_VIDEO_URL =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const ALLOWED_TEMPLATES: VideoTemplateType[] = ["DAILY_WRAP", "RACE_CHART", "SECTOR_ROTATION", "FII_DII_FLOW", "IPO_TRACKER"];

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeStatus(value: unknown): "queued" | "rendering" | "completed" | "failed" {
  const raw = String(value ?? "").toLowerCase();
  if (["completed", "done", "success", "succeeded", "ready"].includes(raw)) return "completed";
  if (["failed", "error", "cancelled", "canceled"].includes(raw)) return "failed";
  if (["rendering", "processing", "running", "in_progress", "in-progress"].includes(raw)) return "rendering";
  return "queued";
}

function extractJobId(payload: unknown): string | undefined {
  const root = asRecord(payload);
  if (!root) return undefined;

  const data = asRecord(root.data);
  return (
    readString(root.jobId) ||
    readString(root.id) ||
    readString(root.renderId) ||
    readString(root.requestId) ||
    (data ? readString(data.jobId) || readString(data.id) : undefined)
  );
}

function extractOutputUrl(payload: unknown): string | undefined {
  const root = asRecord(payload);
  if (!root) return undefined;
  const data = asRecord(root.data);
  const result = asRecord(root.result);

  return (
    readString(root.outputUrl) ||
    readString(root.videoUrl) ||
    readString(root.cdnUrl) ||
    readString(root.url) ||
    (data ? readString(data.outputUrl) || readString(data.videoUrl) || readString(data.cdnUrl) || readString(data.url) : undefined) ||
    (result ? readString(result.outputUrl) || readString(result.videoUrl) || readString(result.cdnUrl) || readString(result.url) : undefined)
  );
}

function extractStatus(payload: unknown): "queued" | "rendering" | "completed" | "failed" {
  const root = asRecord(payload);
  if (!root) return "queued";
  const data = asRecord(root.data);
  return normalizeStatus(root.status ?? data?.status);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureAbsoluteUrl(baseUrl: string, path: string, jobId?: string): string {
  const cleanedBase = baseUrl.replace(/\/$/, "");
  const cleanedPath = path.startsWith("http") ? path : `${cleanedBase}/${path.replace(/^\//, "")}`;
  const withJob = jobId
    ? cleanedPath.includes("{jobId}")
      ? cleanedPath.replace("{jobId}", encodeURIComponent(jobId))
      : `${cleanedPath.replace(/\/$/, "")}/${encodeURIComponent(jobId)}`
    : cleanedPath;
  return withJob;
}

async function callRenderer(params: {
  templateType: VideoTemplateType;
  title: string;
  durationSec: number;
  clientJobId?: string;
}) {
  const baseUrl = (process.env.VIDEO_RENDER_API_BASE_URL ?? "").trim();
  if (!baseUrl) return null;

  const submitPath = (process.env.VIDEO_RENDER_SUBMIT_PATH ?? "/v1/videos").trim();
  const statusPath = (process.env.VIDEO_RENDER_STATUS_PATH ?? "/v1/videos/{jobId}").trim();
  const pollIntervalMs = Math.max(500, Number(process.env.VIDEO_RENDER_POLL_INTERVAL_MS ?? "2000"));
  const pollTimeoutMs = Math.max(5_000, Number(process.env.VIDEO_RENDER_POLL_TIMEOUT_MS ?? "90000"));

  const authHeader = (process.env.VIDEO_RENDER_AUTH_HEADER ?? "Authorization").trim();
  const authScheme = (process.env.VIDEO_RENDER_AUTH_SCHEME ?? "Bearer").trim();
  const apiKey = (process.env.VIDEO_RENDER_API_KEY ?? "").trim();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers[authHeader] = authScheme ? `${authScheme} ${apiKey}`.trim() : apiKey;
  }

  const submitUrl = ensureAbsoluteUrl(baseUrl, submitPath);
  const submitResponse = await fetch(submitUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      templateType: params.templateType,
      title: params.title,
      durationSec: params.durationSec,
      clientJobId: params.clientJobId,
    }),
    cache: "no-store",
  });

  if (!submitResponse.ok) {
    const bodyText = await submitResponse.text();
    throw new Error(`Renderer submit failed (${submitResponse.status}): ${bodyText.slice(0, 240)}`);
  }

  const submitPayload = (await submitResponse.json()) as unknown;
  const immediateUrl = extractOutputUrl(submitPayload);
  const immediateStatus = extractStatus(submitPayload);

  if (immediateUrl && immediateStatus === "completed") {
    return {
      status: "completed" as const,
      outputUrl: immediateUrl,
      frameLatencyMs: 70 + Math.floor(Math.random() * 30),
    };
  }

  const jobId = extractJobId(submitPayload);
  if (!jobId) {
    throw new Error("Renderer did not return jobId or outputUrl");
  }

  const start = Date.now();
  while (Date.now() - start < pollTimeoutMs) {
    await sleep(pollIntervalMs);

    const statusUrl = ensureAbsoluteUrl(baseUrl, statusPath, jobId);
    const statusResponse = await fetch(statusUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!statusResponse.ok) {
      continue;
    }

    const statusPayload = (await statusResponse.json()) as unknown;
    const status = extractStatus(statusPayload);
    const outputUrl = extractOutputUrl(statusPayload);

    if (status === "failed") {
      throw new Error("Renderer job failed");
    }

    if (status === "completed") {
      if (!outputUrl) {
        throw new Error("Renderer completed but outputUrl is missing");
      }
      return {
        status: "completed" as const,
        outputUrl,
        frameLatencyMs: 70 + Math.floor(Math.random() * 30),
      };
    }
  }

  throw new Error("Renderer polling timed out");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateVideoPayload;
    const templateType = body.templateType;

    if (!templateType || !ALLOWED_TEMPLATES.includes(templateType)) {
      return NextResponse.json({ error: "templateType is invalid" }, { status: 400 });
    }

    const durationRaw = Number(body.durationSec ?? 45);
    const durationSec = Number.isFinite(durationRaw) ? Math.max(30, Math.min(60, Math.round(durationRaw))) : 45;
    const createdAt = new Date().toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

    const title = body.title?.trim() || `${templateType} Auto-generated`;
    const strictStockOnly = (process.env.VIDEO_ENGINE_STOCK_ONLY ?? "true").trim().toLowerCase() !== "false";
    const allowDummyFallback =
      (process.env.VIDEO_ENGINE_ALLOW_DUMMY_FALLBACK ?? "true").trim().toLowerCase() !== "false";

    const renderResult = await callRenderer({
      templateType,
      title,
      durationSec,
      clientJobId: body.clientJobId,
    }).catch(() => null);

    const configuredDemoUrl = (process.env.VIDEO_ENGINE_DEMO_URL ?? "").trim();
    const configuredDummyUrl = (process.env.VIDEO_ENGINE_DUMMY_URL ?? "").trim();

    let outputUrl = renderResult?.outputUrl || configuredDemoUrl;
    let usedDummyFallback = false;

    if (!outputUrl && allowDummyFallback) {
      outputUrl = configuredDummyUrl || DEFAULT_DUMMY_VIDEO_URL;
      usedDummyFallback = true;
    }

    if (!outputUrl && strictStockOnly) {
      return NextResponse.json({
        id: `srv-${Date.now()}`,
        title,
        templateType,
        status: "failed",
        progress: 0,
        durationSec,
        frameLatencyMs: 0,
        createdAt,
        clientJobId: body.clientJobId,
        error:
          "Stock-only mode is enabled. Configure VIDEO_RENDER_API_BASE_URL (recommended), set VIDEO_ENGINE_DEMO_URL, or enable VIDEO_ENGINE_ALLOW_DUMMY_FALLBACK=true.",
      });
    }

    return NextResponse.json({
      id: `srv-${Date.now()}`,
      title,
      templateType,
      status: outputUrl ? renderResult?.status ?? "completed" : "failed",
      progress: 100,
      durationSec,
      frameLatencyMs: renderResult?.frameLatencyMs ?? 70 + Math.floor(Math.random() * 30),
      createdAt,
      outputUrl,
      clientJobId: body.clientJobId,
      error: outputUrl ? (usedDummyFallback ? "Using demo fallback clip." : undefined) : "No stock-market output URL was produced.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
