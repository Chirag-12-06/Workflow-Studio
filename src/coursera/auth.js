const { launchBrowser } = require("../browser/browser");
const PROFILES = require("../browser/profiles");

async function launchCoursera() {
  const { context, page } = await launchBrowser(PROFILES.COURSERA);

  await page.goto("https://www.coursera.org", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  return { context, page };
}

module.exports = {
  launchCoursera,
};
