// src/hooks/useMockTelemetry.tsx
import React from "react";
import { publishEvent } from "../services/eventBus";

import { SAMPLE_NODES } from "../mock/sample_nodes";
import type { TelemetrySample } from "../utils/status";
import { computeStatus } from "../utils/status";

/**
 * Local ID generator to avoid needing the uuid package in the demo.
 */
function genId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function noise(x = 1) {
  return (Math.random() - 0.5) * x;
}

function makeInitialTimeseries(base: TelemetrySample, seconds = 300) {
  const now = Date.now();
  const arr: TelemetrySample[] = [];
  for (let i = seconds; i >= 0; i--) {
    const ts = now - i * 1000;
    const vuf = Math.max(0, (base.vuf ?? 0.02) + noise(0.006));
    const neutral = Math.max(0, (base.neutral ?? 1) + noise(0.6));
    const vr = (base.voltage_r ?? 230) + noise(1.8);
    const vy = (base.voltage_y ?? 230) + noise(1.8);
    const vb = (base.voltage_b ?? 230) + noise(1.8);
    arr.push({ ts, vuf, neutral, voltage_r: vr, voltage_y: vy, voltage_b: vb });
  }
  return arr;
}

export default function useMockTelemetry(nodeId: string) {
  const nodeDef = SAMPLE_NODES.find((n) => n.id === nodeId);

  // mode (auto/manual) initial from nodeDef
  const [mode, setMode] = React.useState<"auto" | "manual">(
    (nodeDef?.mode as "auto" | "manual") ?? "auto"
  );

  // events for this node (switch actions etc)
  const [events, setEvents] = React.useState<Array<any>>(() => []);

  // timeseries buffer
  const [timeseries, setTimeseries] = React.useState<TelemetrySample[]>(() => {
    const base = nodeDef?.telemetry ?? {
      vuf: 0.02,
      neutral: 1.2,
      voltage_r: 230,
    };
    return makeInitialTimeseries(base);
  });

  // helper to build a sanitized sample
  function sample(t: TelemetrySample) {
    return {
      ts: t.ts ?? Date.now(),
      vuf: t.vuf ?? 0,
      neutral: t.neutral ?? 0,
      voltage_r: t.voltage_r ?? 230,
      voltage_y: t.voltage_y ?? 230,
      voltage_b: t.voltage_b ?? 230,
    } as TelemetrySample;
  }

  // interval to push new samples (simulating real telemetry). Also simulate occasional auto-actuation when mode=auto.
  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeseries((prev) => {
        const last = prev[prev.length - 1] ?? {
          ts: Date.now(),
          vuf: 0.02,
          neutral: 1.2,
          voltage_r: 230,
        };
        // use safe defaults when reading
        const lastVuf = last?.vuf ?? 0.02;
        const lastNeutral = last?.neutral ?? 1.0;
        let vuf = Math.max(0, lastVuf + noise(0.002));
        let neutral = Math.max(0, lastNeutral + noise(0.2));
        if (Math.random() < 0.02) vuf += Math.random() * 0.03;

        const vr = (last.voltage_r ?? 230) + noise(0.8);
        const vy = (last.voltage_y ?? 230) + noise(0.8);
        const vb = (last.voltage_b ?? 230) + noise(0.8);

        const newSample = sample({
          ts: Date.now(),
          vuf,
          neutral,
          voltage_r: vr,
          voltage_y: vy,
          voltage_b: vb,
        });
        const next = [...prev.slice(-300), newSample];
        return next;
      });

      // small auto-actuation simulation when in auto mode and a small probability
      if (mode === "auto" && Math.random() < 0.06) {
        setTimeseries((prev) => {
          const last = prev[prev.length - 1];
          if (!last) return prev;
          const lastVuf = last.vuf ?? 0;
          if (lastVuf > 0.035) {
            const before = sample(last);
            const after = sample({
              ...last,
              ts: Date.now() + 50,
              vuf: Math.max(0, lastVuf - (0.02 + Math.random() * 0.02)),
              neutral: Math.max(
                0,
                (last.neutral ?? 0) - (0.5 + Math.random() * 1.5)
              ),
            });

            // push event safely
            const evAuto = {
              id: genId(),
              ts: Date.now(),
              type: "auto-switch",
              nodeId: nodeId,
              details: `Auto switched phases, VUF ${(before.vuf ?? 0).toFixed(
                3
              )} -> ${(after.vuf ?? 0).toFixed(3)}`,
              before,
              after,
            };
            setEvents((ev) => [...ev, evAuto]);
            publishEvent(evAuto);

            return [...prev.slice(-299), after];
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(id);
  }, [mode]);

  const latest = timeseries[timeseries.length - 1];

  // sendCommand simulation for manual control
  function sendCommand(command: { type: string; payload?: any }) {
    const cmdId = genId();
    const before = sample(
      latest ?? { ts: Date.now(), vuf: 0, neutral: 0, voltage_r: 230 }
    );
    // push a "pending" event
    const pending = {
      id: cmdId,
      ts: Date.now(),
      type: "command-sent",
      nodeId: nodeId,
      details: command.type,
      status: "pending",
      payload: command.payload,
    };
    setEvents((ev) => [...ev, pending]);
    publishEvent(pending);

    return new Promise((resolve) => {
      setTimeout(() => {
        // compute after: reduce vuf moderately to simulate good result (use safe defaults)
        const lastSample = latest ?? before;
        const lastVuf = lastSample.vuf ?? 0;
        const lastNeutral = lastSample.neutral ?? 0;

        const after = sample({
          ...lastSample,
          ts: Date.now(),
          vuf: Math.max(0, lastVuf - (0.015 + Math.random() * 0.02)),
          neutral: Math.max(0, lastNeutral - (0.5 + Math.random() * 1.0)),
        });

        // push into timeseries
        setTimeseries((prev) => [...prev.slice(-299), after]);

        // update events with ack (filter pending one out)
        const ack = {
          id: cmdId,
          ts: Date.now(),
          type: "command-ack",
          nodeId: nodeId,
          details: `Ack: ${command.type} — VUF ${(before.vuf ?? 0).toFixed(
            3
          )} → ${(after.vuf ?? 0).toFixed(3)}`,
          status: "success",
          before,
          after,
        };
        setEvents((ev) => [...ev.filter((e) => e.id !== cmdId), ack]);
        publishEvent(ack);

        resolve({
          cmdId,
          status: "success",
          before,
          after,
        });
      }, 1200 + Math.random() * 800);
    });
  }

  // compute computed status for UI use
  const status = computeStatus(latest);

  return {
    nodeMeta: nodeDef,
    mode,
    setMode,
    latest,
    timeseries,
    events,
    sendCommand,
    status,
  };
}
