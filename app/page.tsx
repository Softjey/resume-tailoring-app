"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
  Sparkles,
  Stars,
  Upload,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PDFPreview } from "@/components/pdf-preview";
import {
  ProgressModal,
  type ProgressModalStep,
  type StepStatus,
} from "@/components/progress-modal";
import { cn } from "@/lib/utils";

interface GeneratedResume {
  theme: string;
  pdfUrl: string;
  label: string;
  id: string;
}

type Stage = "landing" | "form" | "loading" | "preview";

interface TimelineStep {
  id: string;
  label: string;
  note: string;
  duration: number;
  artificial?: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "upload",
    label: "Encrypting your resume upload",
    note: "Secure tunnel & antivirus scan",
    duration: 2600,
  },
  {
    id: "analysis",
    label: "Decoding the job DNA",
    note: "LLM extracts intent & signals",
    duration: 3200,
  },
  {
    id: "alignment",
    label: "Mapping your experience",
    note: "Matching impact stories to role",
    duration: 3000,
  },
  {
    id: "themes",
    label: "Generating draft variations",
    note: "Multiple ATS-friendly styles",
    duration: 3100,
  },
  {
    id: "polish",
    label: "Polishing tone & keywords",
    note: "Intentional phrasing + ATS tuning",
    duration: 3000,
    artificial: true,
  },
  {
    id: "render",
    label: "Rendering premium themes",
    note: "Layering typography system",
    duration: 2900,
    artificial: true,
  },
  {
    id: "handoff",
    label: "Staging interactive preview",
    note: "Preparing download endpoints",
    duration: 2800,
    artificial: true,
  },
];

interface ProgressVisualState {
  progress: number;
  activeStepId: string;
  completedIds: string[];
}

const createInitialProgressState = (): ProgressVisualState => ({
  progress: 0,
  activeStepId: TIMELINE_STEPS[0].id,
  completedIds: [],
});

export default function Home() {
  const { toast } = useToast();
  const [stage, setStage] = useState<Stage>("landing");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [pendingResumes, setPendingResumes] = useState<GeneratedResume[]>([]);
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>(
    []
  );
  const [timelineDone, setTimelineDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [progressState, setProgressState] = useState<ProgressVisualState>(
    createInitialProgressState
  );
  const [downloadingTheme, setDownloadingTheme] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const cancelTimelineRef = useRef(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Unsupported file",
        description: "Only PDF resumes are accepted",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
    toast({
      title: "Resume locked in",
      description: file.name,
    });
  };

  const resetProgress = () => {
    setProgressState(createInitialProgressState());
    setTimelineDone(false);
    setApiDone(false);
    cancelTimelineRef.current = false;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!useMock) {
      if (!resumeFile) {
        toast({
          title: "Resume missing",
          description: "Upload your base resume to continue",
          variant: "destructive",
        });
        return;
      }

      if (!jobDescription.trim()) {
        toast({
          title: "Job description missing",
          description: "Paste the job description for alignment",
          variant: "destructive",
        });
        return;
      }
    }

    setStage("loading");
    resetProgress();
    setPendingResumes([]);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }
      formData.append("useMock", String(useMock));

      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to process resume" }));
        throw new Error(errorData.error || "Failed to process resume");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.resumes)) {
        setPendingResumes(data.resumes);
        setApiDone(true);
        toast({
          title: "Tailoring complete",
          description: "Finishing touches are being staged",
        });
      } else {
        throw new Error(data.error || "Unexpected response received");
      }
    } catch (error) {
      console.error("[resume] tailor error", error);
      toast({
        title: "Unable to tailor resume",
        description:
          error instanceof Error ? error.message : "Please try again shortly",
        variant: "destructive",
      });
      setStage("form");
      setTimelineDone(false);
      setApiDone(false);
      cancelTimelineRef.current = true;
    }
  };

  const handleDownload = async (theme: string, id: string) => {
    try {
      setDownloadingTheme(theme);
      const response = await fetch(
        `/api/download-resume?theme=${encodeURIComponent(
          theme
        )}&id=${encodeURIComponent(id)}`
      );

      if (!response.ok) {
        throw new Error("Failed to download resume");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `resume-${theme}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);

      toast({
        title: "Download ready",
        description: `${theme} theme saved locally`,
      });
    } catch (error) {
      console.error("[resume] download error", error);
      toast({
        title: "Download failed",
        description: "Please retry in a moment",
        variant: "destructive",
      });
    } finally {
      setDownloadingTheme(null);
    }
  };

  useEffect(() => {
    if (stage !== "loading") {
      cancelTimelineRef.current = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    cancelTimelineRef.current = false;
    setProgressState(createInitialProgressState());
    setTimelineDone(false);

    const totalSteps = TIMELINE_STEPS.length;

    const runTimeline = async () => {
      for (let index = 0; index < TIMELINE_STEPS.length; index += 1) {
        if (cancelTimelineRef.current) return;
        const step = TIMELINE_STEPS[index];

        await new Promise<void>((resolve) => {
          const start = performance.now();
          const stepPortion = 100 / totalSteps;

          const tick = (now: number) => {
            if (cancelTimelineRef.current) {
              resolve();
              return;
            }

            const elapsed = now - start;
            const ratio = Math.min(elapsed / step.duration, 1);
            const computed =
              index * stepPortion + Math.min(ratio * stepPortion, stepPortion);

            setProgressState((prev) => ({
              progress: computed,
              activeStepId: step.id,
              completedIds: prev.completedIds,
            }));

            if (ratio < 1) {
              rafRef.current = requestAnimationFrame(tick);
            } else {
              setProgressState((prev) => ({
                progress: index === totalSteps - 1 ? 100 : computed,
                activeStepId: step.id,
                completedIds: prev.completedIds.includes(step.id)
                  ? prev.completedIds
                  : [...prev.completedIds, step.id],
              }));
              resolve();
            }
          };

          rafRef.current = requestAnimationFrame(tick);
        });

        if (cancelTimelineRef.current) return;
      }

      setTimelineDone(true);
    };

    runTimeline();

    return () => {
      cancelTimelineRef.current = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== "loading") return;

    if (timelineDone && apiDone) {
      const timeout = setTimeout(() => {
        setGeneratedResumes(pendingResumes);
        setStage("preview");
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [apiDone, pendingResumes, stage, timelineDone]);

  const modalSteps = useMemo<ProgressModalStep[]>(
    () =>
      TIMELINE_STEPS.map((step) => {
        const status: StepStatus = progressState.completedIds.includes(step.id)
          ? "done"
          : progressState.activeStepId === step.id
          ? "active"
          : "pending";

        return {
          ...step,
          status,
        } satisfies ProgressModalStep;
      }),
    [progressState.completedIds, progressState.activeStepId]
  );

  const waitingForResults = timelineDone && !apiDone;

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-hidden">
      <BackgroundAurora />
      <ProgressModal
        isOpen={stage === "loading"}
        progress={progressState.progress}
        steps={modalSteps}
        waitingForResults={waitingForResults}
      />

      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="group relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-emerald-400 text-white shadow-lg shadow-purple-500/40">
              <span className="absolute inset-0 rounded-2xl bg-white/10 blur-xl" />
              <Wand2 className="relative size-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                ResumeForge
              </p>
              <p className="text-lg font-semibold text-white">
                Role-matched tailoring
              </p>
            </div>
          </div>
          <div className="hidden gap-3 text-sm text-white/70 md:flex">
            <div className="rounded-full border border-white/10 px-4 py-1">
              <span className="text-white">ATS-Ready PDFs</span>
            </div>
            <div className="rounded-full border border-white/10 px-4 py-1">
              <span>Secure resume processing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-12">
        {stage === "landing" && (
          <LandingView onStart={() => setStage("form")} />
        )}

        {stage === "form" && (
          <FormView
            jobDescription={jobDescription}
            resumeFile={resumeFile}
            useMock={useMock}
            onSubmit={handleSubmit}
            onFileChange={handleFileChange}
            onBack={() => setStage("landing")}
            onChangeJobDescription={setJobDescription}
            onToggleMock={setUseMock}
          />
        )}

        {stage === "preview" && (
          <PreviewView
            resumes={generatedResumes}
            onDownload={handleDownload}
            downloadingTheme={downloadingTheme}
            onRestart={() => {
              setGeneratedResumes([]);
              setPendingResumes([]);
              setStage("form");
            }}
          />
        )}
      </main>

      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-white/60">
          <p>© 2025 ResumeForge — AI resume tailoring for every role.</p>
          <p className="text-white/80">
            Secure uploads • Targeted rewrites • ATS-ready PDFs
          </p>
        </div>
      </footer>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  const highlights = [
    {
      title: "Realtime tailoring",
      description: "Adaptive AI syncs to every job posting within seconds",
    },
    {
      title: "Impact-first edits",
      description: "Wordsmith bullet points to reflect measurable outcomes",
    },
    {
      title: "Private by design",
      description: "Local encryption tunnels keep resumes confidential",
    },
  ];

  return (
    <section className="relative flex flex-col gap-16 overflow-hidden rounded-4xl border border-white/5 bg-linear-to-b from-white/5 to-transparent px-8 py-16 shadow-[0_20px_120px_-60px_rgba(79,70,229,0.6)]">
      <div className="flex flex-col gap-8 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
          <Stars className="size-4 text-emerald-300" />
          AI resume tailoring
        </div>
        <div className="space-y-6">
          <h1 className="flex gap-2 flex-col text-4xl font-semibold leading-tight text-white md:text-6xl">
            <span>Tailor every resume to fit.</span>
            <span className="bg-linear-to-r from-indigo-300 via-purple-200 to-emerald-200 bg-clip-text text-transparent">
              Upload once, match any role.
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/70">
            ResumeForge rewrites your achievements to mirror each job
            description, prioritizes ATS keywords, and produces polished PDFs
            that are ready to send to recruiters instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="group h-14 rounded-full border border-white/20 bg-white/10 px-8 text-base font-semibold text-white transition hover:bg-white/20"
            onClick={onStart}
          >
            Begin tailoring
            <ArrowRight className="ml-2 size-5 transition group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/5 bg-white/5 px-5 py-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <p className="text-sm uppercase tracking-wide text-emerald-200/90">
              {item.title}
            </p>
            <p className="mt-2 text-base text-white/70">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

interface FormViewProps {
  jobDescription: string;
  resumeFile: File | null;
  useMock: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeJobDescription: (value: string) => void;
  onToggleMock: (value: boolean) => void;
  onBack: () => void;
}

function FormView({
  jobDescription,
  resumeFile,
  useMock,
  onSubmit,
  onFileChange,
  onChangeJobDescription,
  onToggleMock,
  onBack,
}: FormViewProps) {
  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Resume inputs
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-white">
            Upload your resume and specify the role
          </h2>
          <p className="text-white/60">
            Secure resume upload plus the role you are targeting.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-white/70 hover:text-white"
        >
          ← Back to intro
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/5 bg-white/5 text-white">
          <CardContent className="space-y-6 p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="resume"
                  className="flex items-center gap-2 text-white"
                >
                  <ShieldCheck className="size-4 text-emerald-200" />
                  Resume upload (PDF)
                </Label>
                <label
                  htmlFor="resume"
                  className={cn(
                    "flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 px-6 py-7 text-sm text-white/60 transition hover:border-white/40",
                    !resumeFile && "bg-white/5"
                  )}
                >
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={onFileChange}
                  />
                  <div className="flex items-center gap-3 text-white">
                    <Upload className="size-5 text-emerald-200" />
                    {resumeFile
                      ? resumeFile.name
                      : "Click to upload or drag & drop"}
                  </div>
                  <p className="text-xs text-white/60">
                    Encrypted locally, never stored. Max 5MB.
                  </p>
                </label>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="jobDescription"
                  className="flex items-center gap-2 text-white"
                >
                  <Sparkles className="size-4 text-fuchsia-200" />
                  Target job description
                </Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(event) =>
                    onChangeJobDescription(event.target.value)
                  }
                  placeholder="Paste the job posting or recruiter notes here..."
                  className="min-h-[220px] resize-y border-white/10 bg-black/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="useMock"
                  checked={useMock}
                  onCheckedChange={(checked) => onToggleMock(Boolean(checked))}
                />
                <Label htmlFor="useMock" className="text-white/70">
                  Use mock payload (dev)
                </Label>
              </div>

              <Button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-400 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/50 transition hover:opacity-90"
              >
                Launch tailoring pipeline
                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 rounded-[28px] border border-white/5 bg-linear-to-b from-white/10 to-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            What we tailor
          </p>
          <div className="space-y-5">
            {["Upload", "Align", "Enhance", "Preview"].map((label, index) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/70">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white">{label}</p>
                  <p className="text-sm text-white/60">
                    {index === 0 && "Import your PDF resume plus target role."}
                    {index === 1 &&
                      "AI mirrors the job description and prioritizes metrics."}
                    {index === 2 &&
                      "We rewrite achievements and queue final themes."}
                    {index === 3 && "Review tailored PDFs before downloading."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
            <p className="font-semibold text-white">
              Results recruiters notice
            </p>
            <p>
              Each step keeps the focus on measurable impact, relevant skills,
              and ATS keyword density so your resume earns more callbacks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface PreviewViewProps {
  resumes: GeneratedResume[];
  onDownload: (theme: string, id: string) => void;
  downloadingTheme: string | null;
  onRestart: () => void;
}

function PreviewView({
  resumes,
  onDownload,
  downloadingTheme,
  onRestart,
}: PreviewViewProps) {
  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Tailored resumes ready
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Preview every optimized PDF
          </h2>
          <p className="text-white/60">
            Compare themes, confirm the details, and download what you need.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onRestart}
          className="text-white/70 hover:text-white"
        >
          Tailor another role
        </Button>
      </div>

      <div className="rounded-4xl border border-emerald-400/30 bg-linear-to-br from-emerald-500/10 via-transparent to-indigo-500/10 p-8">
        <div className="space-y-2 text-center">
          <CheckCircle2 className="mx-auto size-10 text-emerald-300" />
          <h3 className="text-2xl font-semibold text-white">
            Resume set is ready
          </h3>
          <p className="text-white/70">
            Review the wording, quantify the wins, and confirm formatting on
            each tailored PDF before you export it.
          </p>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-3">
          {resumes.map((resume) => (
            <div
              key={resume.theme}
              className="rounded-[28px] border border-white/10 bg-black/30 p-4 shadow-2xl shadow-black/40"
            >
              <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-white/5 bg-white">
                <PDFPreview pdfUrl={resume.pdfUrl} />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold capitalize text-white">
                    {resume.label}
                  </p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
                    Theme
                  </span>
                </div>
                <Button
                  onClick={() => onDownload(resume.theme, resume.id)}
                  disabled={downloadingTheme === resume.theme}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-3 text-white hover:bg-white/20"
                >
                  {downloadingTheme === resume.theme ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {downloadingTheme === resume.theme
                    ? "Preparing download"
                    : "Download PDF"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BackgroundAurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-purple-500/20 blur-[140px]" />
      <div className="absolute bottom-0 left-0 h-[480px] w-[480px] bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-20 right-0 h-[420px] w-[420px] bg-indigo-500/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    </div>
  );
}
