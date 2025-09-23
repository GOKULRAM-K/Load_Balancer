// src/utils/status.ts
export type StatusLevel = "operational" | "degraded" | "critical";

export interface TelemetrySample {
  ts?: number; // unix ms
  vuf?: number; // decimal, e.g. 0.023
  neutral?: number; // amps
  voltage_r?: number;
  voltage_y?: number;
  voltage_b?: number;
  [k: string]: any;
}

export interface StatusResult {
  level: StatusLevel;
  severity: number; // 0..100
  color: string;
  reason: string[]; // short text reasons
}

export const DEFAULT_THRESHOLDS = {
  vuf: { nominal: 0.02, degraded: 0.04 }, // >0.04 => critical
  neutral: { nominal: 2, degraded: 5 }, // amps; tune per deployment
};

const COLORS: Record<StatusLevel, string> = {
  operational: "#2ECC71",
  degraded: "#F39C12",
  critical: "#E74C3C",
};

function clamp01(v: number) {
  if (isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * Compute a status result from telemetry, using configurable thresholds.
 */
export function computeStatus(
  telemetry?: TelemetrySample,
  thresholds = DEFAULT_THRESHOLDS
): StatusResult {
  const reasons: string[] = [];
  if (!telemetry) {
    return {
      level: "degraded",
      severity: 60,
      color: COLORS["degraded"],
      reason: ["no telemetry"],
    };
  }

  const vuf = telemetry.vuf ?? 0;
  const neutral = telemetry.neutral ?? 0;

  const vufNorm = clamp01(vuf / (thresholds.vuf.degraded * 2));
  const neutralNorm = clamp01(neutral / (thresholds.neutral.degraded * 2));

  const severity = Math.round((vufNorm * 0.7 + neutralNorm * 0.3) * 100);

  let level: StatusLevel = "operational";

  if (vuf > thresholds.vuf.degraded || neutral > thresholds.neutral.degraded) {
    level = "critical";
    if (vuf > thresholds.vuf.degraded) reasons.push(`VUF=${vuf.toFixed(3)}`);
    if (neutral > thresholds.neutral.degraded)
      reasons.push(`Neutral=${neutral.toFixed(2)} A`);
  } else if (
    vuf > thresholds.vuf.nominal ||
    neutral > thresholds.neutral.nominal
  ) {
    level = "degraded";
    if (vuf > thresholds.vuf.nominal) reasons.push(`VUF=${vuf.toFixed(3)}`);
    if (neutral > thresholds.neutral.nominal)
      reasons.push(`Neutral=${neutral.toFixed(2)} A`);
  } else {
    level = "operational";
    reasons.push(`VUF=${vuf.toFixed(3)}`, `Neutral=${neutral.toFixed(2)} A`);
  }

  return {
    level,
    severity,
    color: COLORS[level],
    reason: reasons,
  };
}
