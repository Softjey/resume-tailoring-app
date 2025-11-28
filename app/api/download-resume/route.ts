import { type NextRequest, NextResponse } from "next/server";
import { resumeStore } from "@/lib/resume-store";
import { renderTheme } from "@/lib/themes";
import { launch } from "puppeteer";
import { mockResumeData } from "@/lib/mock-resume";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const theme = searchParams.get("theme");
    const id = searchParams.get("id");

    if (!theme || !id) {
      return NextResponse.json(
        { error: "Theme and ID parameters are required" },
        { status: 400 }
      );
    }

    let resume;
    if (id === "mock-resume-id") {
      resume = mockResumeData.jsonResume;
    } else {
      resume = resumeStore.get(id);
    }

    if (!resume) {
      return NextResponse.json(
        {
          error: "Resume not found or expired. Please regenerate your resume.",
        },
        { status: 404 }
      );
    }

    // Generate HTML
    const html = await renderTheme(theme, resume);

    // Generate PDF
    const browser = await launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-${theme}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[v0] Error in download-resume:", error);
    return NextResponse.json(
      { error: "Failed to download resume" },
      { status: 500 }
    );
  }
}
