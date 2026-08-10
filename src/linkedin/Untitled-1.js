const { launchLinkedIn } = require("./auth");
const {
  fillLinkedInPost,
  removeLinkPreview,
} = require("./createPost");

const testPost = `🎉 Excited to share that I’ve successfully completed "Structuring Machine Learning Projects" by DeepLearning.AI and Coursera!

This is a test post for the LinkedIn automation workflow.

Certificate Verification: https://lnkd.in/gJYTZx85

#MachineLearning #DeepLearningAI #Coursera`;

(async () => {
  try {
    const { page } = await launchLinkedIn();

    const composer = await fillLinkedInPost(
      page,
      testPost
    );

    await page.waitForTimeout(5000);

    await page.pause();

    // Don't call removeLinkPreview yet.
  } catch (error) {
    console.error(error);
  }
})();