export type VideoTemplateType = "DAILY_WRAP" | "RACE_CHART" | "SECTOR_ROTATION" | "FII_DII_FLOW" | "IPO_TRACKER";

export type VideoJobStatus = "queued" | "rendering" | "completed" | "failed";

export interface VideoTemplate {
  id: string;
  type: VideoTemplateType;
  name: string;
  targetDurationSec: number;
  cadence: string;
  scenePlan: string[];
}

export interface VideoJob {
  id: string;
  title: string;
  templateType: VideoTemplateType;
  status: VideoJobStatus;
  progress: number;
  durationSec: number;
  frameLatencyMs: number;
  createdAt: string;
  outputUrl?: string;
}

const DEFAULT_DUMMY_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const mockVideoTemplates: VideoTemplate[] = [
  {
    id: "tpl-daily-wrap",
    type: "DAILY_WRAP",
    name: "Daily Market Wrap",
    targetDurationSec: 60,
    cadence: "Every close + on-demand",
    scenePlan: ["Index open-close spread", "Top gainers/losers", "Risk snapshot", "Narrated close outlook"],
  },
  {
    id: "tpl-race-chart",
    type: "RACE_CHART",
    name: "Race Chart Simulator",
    targetDurationSec: 45,
    cadence: "Hourly",
    scenePlan: ["Relative return race", "Momentum shift markers", "Sector winners timeline"],
  },
  {
    id: "tpl-sector-rotation",
    type: "SECTOR_ROTATION",
    name: "Sector Rotation Pulse",
    targetDurationSec: 50,
    cadence: "Every 30 min",
    scenePlan: ["Heat-map animation", "Leader laggard transition", "Smart money allocation hints"],
  },
  {
    id: "tpl-fii-dii",
    type: "FII_DII_FLOW",
    name: "FII / DII Flow Visual",
    targetDurationSec: 35,
    cadence: "Every 15 min",
    scenePlan: ["Net flow bars", "Buy/sell pressure zones", "Impact on index and sectors"],
  },
  {
    id: "tpl-ipo",
    type: "IPO_TRACKER",
    name: "IPO Tracker",
    targetDurationSec: 40,
    cadence: "Daily + listing day events",
    scenePlan: ["Subscription trendline", "GMP movement", "Listing probability model"],
  },
];

export const initialVideoJobs: VideoJob[] = [
  {
    id: "JOB-1182",
    title: "NSE Close Wrap — 29 Mar",
    templateType: "DAILY_WRAP",
    status: "rendering",
    progress: 42,
    durationSec: 62,
    frameLatencyMs: 84,
    createdAt: "Today, 04:08 PM",
  },
  {
    id: "JOB-1181",
    title: "Banking Sector Rotation",
    templateType: "SECTOR_ROTATION",
    status: "queued",
    progress: 0,
    durationSec: 48,
    frameLatencyMs: 0,
    createdAt: "Today, 04:05 PM",
  },
  {
    id: "JOB-1179",
    title: "FII/DII Intraday Flow",
    templateType: "FII_DII_FLOW",
    status: "completed",
    progress: 100,
    durationSec: 34,
    frameLatencyMs: 76,
    createdAt: "Today, 03:52 PM",
    outputUrl: DEFAULT_DUMMY_VIDEO_URL,
  },
];
