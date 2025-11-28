"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Sparkles, Wand2, FileCheck, Download } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ProgressStep {
  id: number
  label: string
  duration: number
  icon: React.ReactNode
}

const steps: ProgressStep[] = [
  {
    id: 1,
    label: "Uploading your resume securely",
    duration: 8000,
    icon: <Upload className="size-5" />,
  },
  {
    id: 2,
    label: "Analyzing job requirements with AI",
    duration: 18000,
    icon: <Sparkles className="size-5" />,
  },
  {
    id: 3,
    label: "Extracting key skills and experiences",
    duration: 15000,
    icon: <FileCheck className="size-5" />,
  },
  {
    id: 4,
    label: "Tailoring resume to match job posting",
    duration: 22000,
    icon: <Wand2 className="size-5" />,
  },
  {
    id: 5,
    label: "Optimizing keywords for ATS systems",
    duration: 15000,
    icon: <CheckCircle2 className="size-5" />,
  },
  {
    id: 6,
    label: "Generating professional themes",
    duration: 12000,
    icon: <Download className="size-5" />,
  },
]

function Upload({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  )
}

interface ProgressModalProps {
  isOpen: boolean
}

export function ProgressModal({ isOpen }: ProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setCompletedSteps([])
      setProgress(0)
      return
    }

    let timeoutId: NodeJS.Timeout
    const startTime = Date.now()
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      if (elapsed < totalDuration) {
        requestAnimationFrame(updateProgress)
      }
    }

    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)

        await new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            setCompletedSteps((prev) => [...prev, i])
            resolve(null)
          }, steps[i].duration)
        })
      }
    }

    updateProgress()
    processSteps()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-md border-border/50 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-primary to-chart-1 shadow-lg mx-auto animate-pulse">
              <Wand2 className="size-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Crafting Your Perfect Resume</h2>
            <p className="text-muted-foreground text-lg">Our AI is working its magic. This may take up to 2 minutes.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">Overall Progress</span>
              <span className="text-foreground font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-primary via-chart-1 to-chart-2 transition-all duration-500 ease-out rounded-full shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index)
              const isCurrent = currentStep === index && !isCompleted
              const isPending = index > currentStep

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/30 shadow-md scale-105"
                      : isCompleted
                        ? "bg-accent/50 border border-border/50"
                        : "bg-muted/30 border border-transparent opacity-60"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center size-10 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : isCurrent
                          ? "bg-primary/20 text-primary animate-pulse"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : isCurrent ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      step.icon
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`font-medium transition-colors ${
                        isCurrent
                          ? "text-foreground"
                          : isCompleted
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  {isCurrent && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="size-2 bg-primary rounded-full animate-bounce" />
                        <span className="size-2 bg-primary rounded-full animate-bounce delay-100" />
                        <span className="size-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              <Sparkles className="size-4 inline-block mr-1 text-primary animate-pulse" />
              Hang tight! We're creating something amazing for you...
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
