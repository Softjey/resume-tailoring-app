import { render } from "resumed";
import he from "he";

export const themes = [
  "elegant",
  "flat",
  "even",
  "kendall",
  "macchiato",
  "pumpkin",
  "modern",
  "short",
  "paper",
  "tan-responsive",
  "rickosborne",
  "eloquent",
  "onepage-plus",
  "autumn",
  "spartan",
  "minimal",
  "crisp",
  "stackoverflow",
  "straightforward",
  "modern-extended",
  "rnord",
  "light-classy-responsive",
  "simplyelegant",
  "projects",
  "msresume",
  "dark-classy-responsive",
  "onepage",
  "slick",
  "rocketspacer",
  "direct",
  "compact",
  "clean",
  "actual",
];

// Helper to recursively decode HTML entities in strings
function decodeResumeData(data: any): any {
  if (typeof data === "string") {
    return he.decode(data);
  }
  if (Array.isArray(data)) {
    return data.map((item) => decodeResumeData(item));
  }
  if (typeof data === "object" && data !== null) {
    const newData: any = {};
    for (const key in data) {
      newData[key] = decodeResumeData(data[key]);
    }
    return newData;
  }
  return data;
}

export async function renderTheme(themeName: string, resume: any) {
  // Decode HTML entities in the resume data before rendering
  const cleanResume = decodeResumeData(resume);

  let themeModule;
  try {
    switch (themeName) {
      case "elegant":
        themeModule = await import("jsonresume-theme-elegant");
        break;
      case "flat":
        themeModule = await import("jsonresume-theme-flat");
        break;
      case "even":
        themeModule = await import("jsonresume-theme-even");
        break;
      case "kendall":
        themeModule = await import("jsonresume-theme-kendall");
        break;
      case "macchiato":
        themeModule = await import("jsonresume-theme-macchiato");
        break;
      case "pumpkin":
        themeModule = await import("jsonresume-theme-pumpkin");
        break;
      case "modern":
        themeModule = await import("jsonresume-theme-modern");
        break;
      case "short":
        themeModule = await import("jsonresume-theme-short");
        break;
      case "paper":
        themeModule = await import("jsonresume-theme-paper");
        break;
      case "tan-responsive":
        themeModule = await import("jsonresume-theme-tan-responsive");
        break;
      case "rickosborne":
        themeModule = await import("jsonresume-theme-rickosborne");
        break;
      case "eloquent":
        themeModule = await import("jsonresume-theme-eloquent");
        break;
      case "onepage-plus":
        themeModule = await import("jsonresume-theme-onepage-plus");
        break;
      case "autumn":
        themeModule = await import("jsonresume-theme-autumn");
        break;
      case "spartan":
        themeModule = await import("jsonresume-theme-spartan");
        break;
      case "minimal":
        themeModule = await import("jsonresume-theme-minimal");
        break;
      case "crisp":
        themeModule = await import("jsonresume-theme-crisp");
        break;
      case "stackoverflow":
        themeModule = await import("jsonresume-theme-stackoverflow");
        break;
      case "straightforward":
        themeModule = await import("jsonresume-theme-straightforward");
        break;
      case "modern-extended":
        themeModule = await import("jsonresume-theme-modern-extended");
        break;
      case "rnord":
        themeModule = await import("jsonresume-theme-rnord");
        break;
      case "light-classy-responsive":
        themeModule = await import("jsonresume-theme-light-classy-responsive");
        break;
      case "simplyelegant":
        themeModule = await import("jsonresume-theme-simplyelegant");
        break;
      case "projects":
        themeModule = await import("jsonresume-theme-projects");
        break;
      case "msresume":
        themeModule = await import("jsonresume-theme-msresume");
        break;
      case "dark-classy-responsive":
        themeModule = await import("jsonresume-theme-dark-classy-responsive");
        break;
      case "onepage":
        themeModule = await import("jsonresume-theme-onepage");
        break;
      case "slick":
        themeModule = await import("jsonresume-theme-slick");
        break;
      case "rocketspacer":
        themeModule = await import("jsonresume-theme-rocketspacer");
        break;
      case "direct":
        themeModule = await import("jsonresume-theme-direct");
        break;
      case "compact":
        themeModule = await import("jsonresume-theme-compact");
        break;
      case "clean":
        themeModule = await import("jsonresume-theme-clean");
        break;
      case "actual":
        themeModule = await import("jsonresume-theme-actual");
        break;
      default:
        throw new Error(`Unknown theme: ${themeName}`);
    }
  } catch (e) {
    console.error(`[v0] Failed to load theme ${themeName}:`, e);
    throw e;
  }

  // Helper to get the render function from a theme module
  const getThemeRender = (mod: any) => {
    if (typeof mod.render === "function") return mod.render;
    if (mod.default && typeof mod.default.render === "function")
      return mod.default.render;
    throw new Error("Theme does not have a render function");
  };

  const renderFn = getThemeRender(themeModule);
  const theme = { render: renderFn };

  return await render(cleanResume, theme);
}
