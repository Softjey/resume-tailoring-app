import { render } from "resumed";
import he from "he";

export const themes = ["even", "elegant", "flat"];

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
    if (themeName === "even") {
      themeModule = await import("jsonresume-theme-even");
    } else if (themeName === "elegant") {
      themeModule = await import("jsonresume-theme-elegant");
    } else if (themeName === "flat") {
      themeModule = await import("jsonresume-theme-flat");
    } else {
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
