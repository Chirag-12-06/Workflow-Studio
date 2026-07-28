const { launchBrowser } = require("../browser/browser");
const PROFILES = require("../browser/profiles");

async function launchPortfolio() {
  const { context, page } = await launchBrowser(PROFILES.PORTFOLIO);

  await page.goto("http://localhost:5173");

  return { context, page };
}

module.exports = {
  launchPortfolio,
};