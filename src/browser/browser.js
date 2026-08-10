const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function launchBrowser(profile = "default", options = {}) {
  const profilePath = path.join(__dirname, "..", "..", "profiles", profile);

  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(profilePath, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(profilePath, {
    // channel: "chrome",
    headless: false,
    viewport: null,
    args: ["--start-maximized"],
    ...options,
  });

  const page = context.pages().length
    ? context.pages()[0]
    : await context.newPage();

  return { context, page };
}

module.exports = {
  launchBrowser,
};
