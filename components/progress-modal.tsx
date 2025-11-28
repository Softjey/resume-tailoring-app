"use client";

import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "active" | "done";

export interface ProgressModalStep {
  id: string;
  label: string;
  note: string;
  status: StepStatus;
  artificial?: boolean;
}

interface ProgressModalProps {
  isOpen: boolean;
  progress: number;
  steps: ProgressModalStep[];
  waitingForResults: boolean;
}

export function ProgressModal({
  isOpen,
  progress,
  steps,
  waitingForResults,
}: ProgressModalProps) {
  if (!isOpen) return null;

  const activeStep =
    steps.find((step) => step.status === "active") ?? steps[steps.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10 backdrop-blur-xl">
      <div className="w-full max-w-3xl rounded-4xl border border-white/10 bg-[#05070d]/90 p-8 shadow-[0_40px_140px_-60px_rgba(79,70,229,0.8)]">
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
              Stage 03
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Orchestrating your resume set
            </h2>
            <p className="text-white/60">
              {waitingForResults
                ? "AI is finalizing payloads — extra polish steps keep things smooth."
                : activeStep?.note ?? "Synchronizing steps"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Realtime progress</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full rounded-full border border-white/10 bg-white/5">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-400 via-purple-400 to-emerald-300 transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col gap-2 rounded-3xl border px-4 py-4 transition",
                  step.status === "active" &&
                    "border-white/30 bg-white/5 shadow-[0_10px_50px_-30px_rgba(147,51,234,0.8)]",
                  step.status === "done" && "border-white/10 bg-white/5",
                  step.status === "pending" &&
                    "border-white/5 bg-transparent text-white/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                    <StatusIcon status={step.status} />
                    <p className="text-base font-medium">{step.label}</p>
                  </div>
                  {step.artificial && (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-white/60">
                      polish
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/60">{step.note}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-white/60">
            <Sparkles className="size-4 text-emerald-200" />
            Seamless flow — no reloads required.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return <CheckCircle2 className="size-5 text-emerald-300" />;
  }
  if (status === "active") {
    return <Loader2 className="size-5 animate-spin text-white" />;
  }
  return <div className="size-2 rounded-full bg-white/30" />;
}
