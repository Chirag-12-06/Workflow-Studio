const { launchBrowser } = require("../browser/browser");
const PROFILES = require("../browser/profiles");

async function launchLinkedIn() {
  const { context, page } = await launchBrowser(PROFILES.LINKEDIN);

  await page.goto("https://www.linkedin.com/feed/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await page.waitForTimeout(5000);

  await page.locator("main").waitFor({
    state: "visible",
    timeout: 30000,
  });

  await page.waitForTimeout(5000);

  console.log("LinkedIn feed loaded");

  return { context, page };
}

module.exports = {
  launchLinkedIn,
};
