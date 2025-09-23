// src/mock/sample_nodes.ts
import type { TelemetrySample } from "../utils/status";

export interface DemoNode {
  id: string;
  name: string;
  district: string;
  taluk: string;
  feeder: string;
  lat: number;
  lng: number;
  telemetry?: TelemetrySample;
  mode?: "auto" | "manual";
}

export const SAMPLE_NODES: DemoNode[] = [
  {
    id: "TVPM-PATT-FD01-TX01",
    name: "Node A — Trivandrum",
    district: "Thiruvananthapuram",
    taluk: "Pattom",
    feeder: "FD01",
    lat: 8.5241,
    lng: 76.9366,
    telemetry: { vuf: 0.035, neutral: 3.8, ts: Date.now() - 60_000 },
    mode: "auto",
  },
  {
    id: "ERNA-KOCH-FD02-TX05",
    name: "Node B — Kochi",
    district: "Ernakulam",
    taluk: "Kochi",
    feeder: "FD02",
    lat: 9.9816,
    lng: 76.2999,
    telemetry: { vuf: 0.048, neutral: 6.2, ts: Date.now() - 45_000 },
    mode: "auto",
  },
  {
    id: "KOZH-CALI-FD03-TX09",
    name: "Node C — Kozhikode",
    district: "Kozhikode",
    taluk: "Calicut",
    feeder: "FD03",
    lat: 11.2588,
    lng: 75.7804,
    telemetry: { vuf: 0.012, neutral: 0.9, ts: Date.now() - 30_000 },
    mode: "auto",
  },
  {
    id: "PLKD-OTTY-FD01-TX12",
    name: "Node D — Palakkad",
    district: "Palakkad",
    taluk: "Ottapalam",
    feeder: "FD01",
    lat: 10.8505,
    lng: 76.2711,
    telemetry: { vuf: 0.018, neutral: 1.4, ts: Date.now() - 10_000 },
    mode: "manual",
  },
  {
    id: "ALPY-MANN-FD04-TX08",
    name: "Node E — Alappuzha",
    district: "Alappuzha",
    taluk: "Mannar",
    feeder: "FD04",
    lat: 9.4981,
    lng: 76.3388,
    telemetry: { vuf: 0.022, neutral: 2.5, ts: Date.now() - 120_000 },
    mode: "auto",
  },
];
