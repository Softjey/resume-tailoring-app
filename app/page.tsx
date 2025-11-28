"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Sparkles, Download, FileText, Loader2, Wand2, Stars, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { PDFPreview } from "@/components/pdf-preview"
import { ProgressModal } from "@/components/progress-modal"

interface GeneratedResume {
  theme: string
  pdfUrl: string
  label: string
  id: string
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [useMock, setUseMock] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>([])
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
        return
      }
      setResumeFile(file)
      toast({
        title: "File uploaded",
        description: file.name,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!useMock) {
        if (!resumeFile) {
        toast({
            title: "Missing file",
            description: "Please upload your resume",
            variant: "destructive",
        })
        return
        }

        if (!jobDescription.trim()) {
        toast({
            title: "Missing information",
            description: "Please enter a job description",
            variant: "destructive",
        })
        return
        }
    }

    setIsLoading(true)
    setGeneratedResumes([])

    try {
      const formData = new FormData()
      formData.append("jobDescription", jobDescription)
      if (resumeFile) {
        formData.append("resume", resumeFile)
      }
      formData.append("useMock", String(useMock))

      console.log('Sending tailor resume request')
      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        console.log('Tailor resume error')
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.log(errorData);
        throw new Error(errorData.error || "Failed to process resume")
      }

      const data = await response.json()

      if (data.success && data.resumes) {
        setGeneratedResumes(data.resumes)
        toast({
          title: "Success!",
          description: "Your resume has been tailored in multiple themes",
        })
      } else {
        throw new Error(data.error || "Failed to generate resumes")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process resume",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (theme: string, id: string) => {
    try {
      const response = await fetch(`/api/download-resume?theme=${theme}&id=${id}`)

      if (!response.ok) {
        throw new Error("Failed to download resume")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume-${theme}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Downloaded!",
        description: `Resume downloaded in ${theme} theme`,
      })
    } catch (error) {
      console.error("[v0] Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download resume",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <ProgressModal isOpen={isLoading} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 size-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-20 size-96 bg-chart-1/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-chart-2/10 rounded-full blur-[150px] animate-pulse delay-2000" />
      </div>

      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <header className="relative border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center shadow-lg">
              <Wand2 className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ResumeForge</h1>
              <p className="text-xs text-muted-foreground">AI-powered resume magic</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-12 max-w-6xl">
        {!showForm ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 py-20">
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm border border-primary/20 animate-fade-in">
                <Stars className="size-4 animate-pulse" />
                Transform Your Resume with AI Magic
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-balance text-foreground leading-tight">
                Land Your Dream Job
                <br />
                <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent animate-gradient">
                  With AI-Crafted Resumes
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
                Upload your resume, paste any job description, and watch as our AI tailors your resume perfectly. Get
                multiple professional themes in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8">
                <Button
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-chart-1 hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
                >
                  <Wand2 className="size-5 group-hover:rotate-12 transition-transform" />
                  Start Tailoring Now
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 max-w-5xl mx-auto">
              <Card className="backdrop-blur-sm bg-card/50 border-border/50 hover:shadow-xl transition-all hover:scale-105">
                <CardContent className="p-6 space-y-3 text-center">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Sparkles className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI analyzes and tailors your resume to match job requirements perfectly
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-card/50 border-border/50 hover:shadow-xl transition-all hover:scale-105">
                <CardContent className="p-6 space-y-3 text-center">
                  <div className="size-12 rounded-full bg-chart-1/10 flex items-center justify-center mx-auto">
                    <FileText className="size-6 text-chart-1" />
                  </div>
                  <h3 className="font-semibold text-lg">Multiple Themes</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from professional, elegant, and flat designs to match your style
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-card/50 border-border/50 hover:shadow-xl transition-all hover:scale-105">
                <CardContent className="p-6 space-y-3 text-center">
                  <div className="size-12 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto">
                    <Download className="size-6 text-chart-2" />
                  </div>
                  <h3 className="font-semibold text-lg">Instant Download</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your tailored resume in seconds, ready to submit to employers
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12 space-y-4">
              <Button onClick={() => setShowForm(false)} variant="ghost" size="sm" className="mb-4">
                ← Back to Home
              </Button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="size-4" />
                AI-Powered Resume Tailoring
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-balance text-foreground">
                Create Your
                <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                  {" "}
                  Perfect Resume
                </span>
              </h2>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                Upload your resume first, then paste the job description. Our AI will tailor it perfectly.
              </p>
            </div>

            <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="resume" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <FileText className="size-4" />
                      Your Resume (PDF)
                    </label>
                    <div className="relative">
                      <input type="file" id="resume" accept=".pdf" onChange={handleFileChange} className="sr-only" />
                      <label
                        htmlFor="resume"
                        className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-background/50 hover:bg-accent/5"
                      >
                        <Upload className="size-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="jobDescription"
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <Sparkles className="size-4" />
                      Job Description
                    </label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[200px] resize-y bg-background/50"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="useMock" 
                        checked={useMock} 
                        onCheckedChange={(checked) => setUseMock(checked as boolean)} 
                    />
                    <Label htmlFor="useMock">Use Mock Data (Dev Only)</Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-chart-1 hover:opacity-90 transition-opacity"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Processing Your Resume...
                      </>
                    ) : (
                      <>
                        <Wand2 className="size-5" />
                        Tailor My Resume
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {generatedResumes.length > 0 && (
              <div className="mt-12 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Your Tailored Resumes</h3>
                  <p className="text-muted-foreground">Select your favorite theme and download</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {generatedResumes.map((resume) => (
                    <Card key={resume.theme} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-[400px] w-full bg-muted relative overflow-hidden">
                        <PDFPreview pdfUrl={resume.pdfUrl} />
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h4 className="font-semibold text-lg capitalize text-foreground">{resume.label}</h4>
                        <Button onClick={() => handleDownload(resume.theme, resume.id)} className="w-full" variant="outline">
                          <Download className="size-4" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="relative border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 ResumeForge. Powered by AI to help you land your dream job.</p>
        </div>
      </footer>
    </div>
  )
}
