"use client";

import { useMemo, useState } from "react";
import {
  CollisionResult,
  SimulationInput,
  Vec3,
  simulateCollision,
} from "@/lib/collision";
import { VectorInput } from "@/components/vector-input";

const defaultState: SimulationInput = {
  ballPosition: { x: 18, y: 2, z: -6 },
  ballVelocity: { x: -12, y: -3, z: 4 },
  ballSize: { x: 4.5, y: 4.5, z: 4.5 },
  playerPosition: { x: 0, y: 0, z: 0 },
  playerVelocity: { x: 5, y: 0, z: -2 },
};

type MetricProps = {
  label: string;
  value: string;
  accent?: "primary" | "danger" | "muted";
};

function MetricCard({ label, value, accent = "muted" }: MetricProps) {
  const palette =
    accent === "primary"
      ? "border-indigo-200 bg-indigo-50/60 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
      : accent === "danger"
      ? "border-rose-200 bg-rose-50/60 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
      : "border-zinc-200 bg-white/70 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200";

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${palette}`}
    >
      <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  );
}

function formatResult(result: CollisionResult | undefined) {
  if (!result) {
    return { time: "–", distance: "–" };
  }

  if (result.time === null) {
    return { time: "No intercept", distance: "–" };
  }

  return {
    time: `${result.time.toFixed(3)} s`,
    distance:
      result.distanceAtImpact === null
        ? "–"
        : `${result.distanceAtImpact.toFixed(2)} studs`,
  };
}

function describeUrgency(time: number | null) {
  if (time === null) {
    return { label: "No action required", accent: "muted" as const };
  }

  if (time < 0.3) {
    return { label: "Immediate input required", accent: "danger" as const };
  }

  if (time < 0.8) {
    return { label: "Prepare input", accent: "primary" as const };
  }

  return { label: "Monitor trajectory", accent: "muted" as const };
}

function formatVector(vec: Vec3 | null) {
  if (!vec) {
    return "–";
  }

  return `(${vec.x.toFixed(2)}, ${vec.y.toFixed(2)}, ${vec.z.toFixed(2)})`;
}

export default function Home() {
  const [input, setInput] = useState<SimulationInput>(defaultState);

  const simulation = useMemo(() => simulateCollision(input), [input]);

  const sumResult = simulation.results.find((r) => r.mode === "sum");
  const diffResult = simulation.results.find((r) => r.mode === "difference");

  const preferredResult =
    diffResult?.time !== null ? diffResult : sumResult ?? diffResult;
  const urgency = describeUrgency(preferredResult?.time ?? null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14 lg:px-12">
        <header className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-500/60 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            Roblox interception lab
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Predict ball contact timing with real-time physics.
          </h1>
          <p className="max-w-2xl text-base text-zinc-300">
            Experiment with the spatial relationship between your avatar and an
            incoming ball. Adjust positions, velocities, and size to predict
            when you should fire input for a perfect interception. Results
            reflect both the original Lua sum velocity strategy and a relative
            velocity model.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">
          <div className="flex flex-col gap-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-lg shadow-black/40 backdrop-blur">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Scenario setup
            </h2>
            <VectorInput
              label="Ball position"
              value={input.ballPosition}
              onChange={(value) =>
                setInput((prev) => ({ ...prev, ballPosition: value }))
              }
              step={0.5}
            />
            <VectorInput
              label="Ball velocity"
              value={input.ballVelocity}
              onChange={(value) =>
                setInput((prev) => ({ ...prev, ballVelocity: value }))
              }
              step={0.5}
            />
            <VectorInput
              label="Ball size (studs)"
              value={input.ballSize}
              onChange={(value) =>
                setInput((prev) => ({ ...prev, ballSize: value }))
              }
              step={0.1}
            />
            <VectorInput
              label="Player position"
              value={input.playerPosition}
              onChange={(value) =>
                setInput((prev) => ({ ...prev, playerPosition: value }))
              }
              step={0.5}
            />
            <VectorInput
              label="Player velocity"
              value={input.playerVelocity}
              onChange={(value) =>
                setInput((prev) => ({ ...prev, playerVelocity: value }))
              }
              step={0.5}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-lg shadow-black/30 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Interception metrics
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="Effective radius"
                  value={`${simulation.radius.toFixed(2)} studs`}
                  accent="muted"
                />
                <MetricCard
                  label="Urgency"
                  value={urgency.label}
                  accent={urgency.accent}
                />
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-zinc-800/70 bg-black/20 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                    Relative velocity model
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="Impact time"
                      value={formatResult(diffResult).time}
                      accent="primary"
                    />
                    <MetricCard
                      label="Distance at impact"
                      value={formatResult(diffResult).distance}
                      accent="muted"
                    />
                    <MetricCard
                      label="Impact point"
                      value={formatVector(diffResult?.impactPoint ?? null)}
                      accent="muted"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800/70 bg-black/10 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-200">
                    Lua sum velocity model
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="Impact time"
                      value={formatResult(sumResult).time}
                      accent="danger"
                    />
                    <MetricCard
                      label="Distance at impact"
                      value={formatResult(sumResult).distance}
                      accent="muted"
                    />
                    <MetricCard
                      label="Impact point"
                      value={formatVector(sumResult?.impactPoint ?? null)}
                      accent="muted"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
                Input cue
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100">
                Trigger your interaction when the countdown reaches zero. The
                predicted window is derived from the relative velocity model. If
                the Lua-style sum velocity model indicates an earlier impact,
                bias toward that timing to mirror the original script&apos;s
                behaviour.
              </p>
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-tight text-white">
                  {preferredResult?.time !== null &&
                  preferredResult?.time !== undefined
                    ? `${Math.max(preferredResult.time, 0).toFixed(3)}`
                    : "∞"}
                </span>
                <span className="text-sm uppercase tracking-wide text-indigo-200">
                  seconds to press
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-zinc-800/60 pt-6 text-xs text-zinc-500">
          <p>
            Built for quick prototyping of Roblox interception routines. Tweak
            the model inputs to mirror in-game telemetry and align your virtual
            input automation with physics predictions.
          </p>
          <p>
            Sum velocity mode mirrors the original Lua snippet&apos;s{" "}
            <code>ball.Velocity + rootPart.Velocity</code> logic. Relative
            velocity mode uses motion in the player&apos;s reference frame for a
            more traditional interception forecast.
          </p>
        </footer>
      </main>
    </div>
  );
}
