import { type NextRequest, NextResponse } from "next/server"
import { resumeStore } from "@/lib/resume-store"
import { themes } from "@/lib/themes"
import { mockResumeData } from "@/lib/mock-resume"

export async function POST(request: NextRequest) {
  try {
    console.log('Starting tailor resume request')
    const formData = await request.formData()
    const jobDescription = formData.get("jobDescription") as string
    const resumeFile = formData.get("resume") as File
    const useMock = formData.get("useMock") === "true"

    console.log("[v0] API Route - Received request", {
      hasJobDescription: !!jobDescription,
      hasResumeFile: !!resumeFile,
      jobDescriptionLength: jobDescription?.length,
      resumeFileName: resumeFile?.name,
      useMock
    })

    if (!useMock && (!jobDescription || !resumeFile)) {
      console.error("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let jsonResume;

    if (useMock) {
        console.log("[v0] Using mock resume data")
        jsonResume = mockResumeData.jsonResume
    } else {
        const webhookFormData = new FormData()
        webhookFormData.append("jobDescription", jobDescription)
        webhookFormData.append("resume", resumeFile)

        console.log("[v0] Sending request to n8n webhook...")

        const webhookResponse = await fetch("https://softjey.app.n8n.cloud/webhook/resume/tailor", {
          method: "POST",
          body: webhookFormData,
        })

        console.log("[v0] Webhook response status:", webhookResponse.status)

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text()
          console.error("[v0] Webhook error:", errorText)
          throw new Error(`Failed to process resume with webhook: ${webhookResponse.status}`)
        }

        const responseData = await webhookResponse.json()
        console.log("[v0] Received response from webhook, has jsonResume:", !!responseData.jsonResume)

        jsonResume = responseData.jsonResume
    }

    if (!jsonResume) {
      throw new Error("No jsonResume returned")
    }

    // Store resume in cache
    const resumeId = useMock ? "mock-resume-id" : crypto.randomUUID()
    resumeStore.set(resumeId, jsonResume)

    const resumes = themes.map(theme => ({
      theme,
      pdfUrl: `/api/preview-resume?id=${resumeId}&theme=${theme}`,
      label: theme.charAt(0).toUpperCase() + theme.slice(1),
      id: resumeId // Pass ID for download
    }))

    console.log(`[v0] Successfully generated ${resumes.length} resume previews`)

    return NextResponse.json({
      success: true,
      resumes,
    })
  } catch (error) {
    console.error("[v0] Error in tailor-resume:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process resume" },
      { status: 500 },
    )
  }
}

// Clean up cache periodically (every 30 minutes)
setInterval(
  () => {
    resumeStore.clear()
    console.log("[v0] Resume cache cleared")
  },
  30 * 60 * 1000,
)
