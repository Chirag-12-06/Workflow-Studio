const { launchBrowser } = require("../browser/browser");
const PROFILES = require("../browser/profiles");

async function launchChatGPT() {
  const { context, page } = await launchBrowser(PROFILES.CHATGPT);

  await page.goto("https://chatgpt.com", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  return { context, page };
}

module.exports = {
  launchChatGPT,
};
