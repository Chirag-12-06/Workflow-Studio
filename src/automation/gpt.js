const { launchChatGPT } = require("../chatgpt/auth");

(async () => {
  const { page, context } = await launchChatGPT();
})();
