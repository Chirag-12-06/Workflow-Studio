const { launchLinkedIn } = require("./auth");

async function openPostComposer(page) {
  const startPostButton = page.getByRole("button", {
    name: "Start a post",
  });

  if (await startPostButton.isVisible().catch(() => false)) {
    await startPostButton.click();
  }

  const editor = page
    .getByTestId("ui-core-tiptap-text-editor-wrapper")
    .getByRole("paragraph");

  await editor.first().waitFor({
    state: "visible",
    timeout: 30000,
  });

  console.log("Composer opened");
}

async function fillLinkedInPost(page, postText) {
  const editor = page
    .getByTestId("ui-core-tiptap-text-editor-wrapper")
    .getByRole("paragraph");

  await editor.first().waitFor({
    state: "visible",
    timeout: 15000,
  });

  await editor.first().click();
  await page.keyboard.insertText(postText);

  console.log("Post text filled");
}

async function removeLinkPreview(page) {
  const removePreviewButton = page
    .getByTestId("lazy-column")
    .getByRole("button", { name: "Dismiss" });

  await removePreviewButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await removePreviewButton.click();

  console.log("Link preview removed");

  await page.locator("#ShareBoxLinkPreview").waitFor({
    state: "detached",
    timeout: 10000,
  });

  console.log("Link preview removal confirmed");
}

async function attachCertificate(page, pdfPath, certificateTitle) {
  const expandContentTypesButton = page.getByRole("button", {
    name: "Expand content types",
  });

  await expandContentTypesButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await expandContentTypesButton.click();

  console.log("Content types expanded");

// 1. Select Document
await page.getByRole("link", { name: "Document" }).click();

console.log("Document option selected");

// 2. Locate Choose file
const chooseFile = page.getByRole("button", {
  name: "Choose file",
});

await chooseFile.waitFor({
  state: "visible",
  timeout: 15000,
});

// 3. Listen for the file chooser BEFORE clicking
const fileChooserPromise = page.waitForEvent("filechooser");

await chooseFile.click();

const fileChooser = await fileChooserPromise;

// 4. Select the PDF
// const pdfPath =
//   "D:\\OneDrive\\Desktop\\Certificates\\Natural Language Processing with Attention Models.pdf";

await fileChooser.setFiles(pdfPath);

console.log("Certificate PDF selected");

// 5. Fill document title
const documentTitle = page.getByRole("textbox", {
  name: "Document title*",
});

await documentTitle.waitFor({
  state: "visible",
  timeout: 30000,
});

await documentTitle.fill(certificateTitle);

await page.getByRole("button", { name: "Done" }).click();

console.log("Certificate attached");

// Click Post only when you're ready to publish.
await page.getByRole("button", { name: "Post", exact: true }).click();

console.log("LinkedIn post published");
  
}

(async () => {
  const { page, context } = await launchLinkedIn();

  try {
    const postText = `
I recently completed a course on Natural Language Processing.

I'm looking forward to applying what I've learned to practical projects.

#MachineLearning #NLP #Learning
https://www.coursera.org/account/accomplishments/verify/SODDM9SUNX55
`.trim();

    const pdfPath =
      "D:\\OneDrive\\Desktop\\Certificates\\Natural Language Processing with Attention Models.pdf";

    const certificateTitle =
      "Natural Language Processing with Attention Models";

    await openPostComposer(page);

    await fillLinkedInPost(page, postText);

    await removeLinkPreview(page);

    await attachCertificate(page, pdfPath, certificateTitle);

    console.log("\nTEST PASSED: Composer and document attachment work.");

    // Keep the browser open so you can inspect the composer.
    await page.pause();
  } catch (error) {
    console.error("\nLinkedIn composer test failed:");
    console.error(error);

    await page.screenshot({
      path: "linkedin-composer-test-error.png",
      fullPage: false,
    });

    await page.pause();
  }

  // Intentionally do not close the context automatically.
  // LinkedIn may prompt to save the post as a draft if the composer
  // still contains unsaved content.
})();