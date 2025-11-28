import { type NextRequest, NextResponse } from "next/server";
import { resumeStore } from "@/lib/resume-store";
import { renderTheme } from "@/lib/themes";
import { mockResumeData } from "@/lib/mock-resume";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const theme = searchParams.get("theme");

    if (!id || !theme) {
      return new NextResponse("Missing id or theme", { status: 400 });
    }

    let resume;
    if (id === "mock-resume-id") {
      resume = mockResumeData.jsonResume;
    } else {
      resume = resumeStore.get(id);
    }

    if (!resume) {
      return new NextResponse("Resume not found or expired", { status: 404 });
    }

    const html = await renderTheme(theme, resume);

    // Inject minimal CSS to ensure desktop layout
    const styleInjection = `
      <style>
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-width: 794px; /* Force desktop width */
          background: white;
        }
        /* Hide scrollbars in preview */
        ::-webkit-scrollbar {
          display: none;
        }
      </style>
    `;

    // Simple injection before closing head or body
    let modifiedHtml = html;
    if (html.includes("</head>")) {
      modifiedHtml = html.replace("</head>", `${styleInjection}</head>`);
    } else {
      modifiedHtml = `${styleInjection}${html}`;
    }

    return new NextResponse(modifiedHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("[v0] Error in preview-resume:", error);
    return new NextResponse("Failed to generate preview", { status: 500 });
  }
}
