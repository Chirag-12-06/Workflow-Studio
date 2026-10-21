const openai = require("./config");
const { LINKEDIN_STYLE_GUIDE } = require("./prompt");

async function generateLinkedInPost(certificate) {
  const certificateJson = JSON.stringify(certificate, null, 2);

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: LINKEDIN_STYLE_GUIDE,
    input: `
Write a LinkedIn post for the certificate represented by
the following JSON.

Use ONLY the information contained in this JSON.

CERTIFICATE JSON:

${certificateJson}
`,
  });

  let postText = response.output_text.trim();

  if (!postText) {
    throw new Error("OpenAI returned an empty LinkedIn post.");
  }

  // Convert Markdown links into plain URLs.
  postText = postText.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$2");

  return postText;
}

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
    .getByRole("button", {
      name: "Dismiss",
    });

  await removePreviewButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await removePreviewButton.click();

  console.log("Link preview removed");

  const preview = page.locator("#ShareBoxLinkPreview");

  await preview.waitFor({
    state: "detached",
    timeout: 10000,
  });

  console.log("Link preview removal confirmed");
}

async function attachCertificate(page, certificate) {
  // 1. Expand content types.
  const expandContentTypesButton = page.getByRole("button", {
    name: "Expand content types",
  });

  await expandContentTypesButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await expandContentTypesButton.click();

  console.log("Content types expanded");

  // 2. Select Document.
  await page
    .getByRole("link", {
      name: "Document",
    })
    .click();

  console.log("Document option selected");

  // 3. Wait for Choose file.
  const chooseFile = page.getByRole("button", {
    name: "Choose file",
  });

  await chooseFile.waitFor({
    state: "visible",
    timeout: 15000,
  });

  // 4. Register the file chooser listener before clicking.
  const fileChooserPromise = page.waitForEvent("filechooser");

  await chooseFile.click();

  const fileChooser = await fileChooserPromise;

  // 5. Select the certificate PDF from the certificate JSON.
  await fileChooser.setFiles(certificate.pdfPath);

  console.log("Certificate PDF selected");

  // 6. Fill the document title.
  const documentTitle = page.getByRole("textbox", {
    name: "Document title*",
  });

  await documentTitle.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await documentTitle.fill(certificate.title);

  console.log(`Document title filled: ${certificate.title}`);

  // 7. Attach the document.
  const doneButton = page.getByRole("button", {
    name: "Done",
  });

  await doneButton.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await doneButton.click();

  console.log("Document attached successfully");
}

async function publishLinkedInPost(page) {
  const postButton = page.getByRole("button", {
    name: "Post",
    exact: true,
  });

  await postButton.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await postButton.click();

  console.log("LinkedIn post published");
}

async function prepareLinkedInPost(page, certificate) {
  // 1. Generate the post using OpenAI.
  console.log("Generating LinkedIn post with OpenAI...");

  const postText = await generateLinkedInPost(certificate);

  console.log("\nGenerated LinkedIn post:\n");
  console.log(postText);
  console.log("\n-----------------------------------\n");

  // 2. Open the composer.
  await openPostComposer(page);

  // 3. Fill the generated post.
  await fillLinkedInPost(page, postText);

  // 4. Remove the credential link preview.
  await removeLinkPreview(page);

  // 5. Attach the certificate PDF.
  await attachCertificate(page, certificate);

  // 6. Publish the post.
  await publishLinkedInPost(page);

  console.log("LinkedIn post published successfully.");

  return postText;
}

module.exports = {
  generateLinkedInPost,
  prepareLinkedInPost,
};
