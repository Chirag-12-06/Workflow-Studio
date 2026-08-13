const openai = require("./config");
const { LINKEDIN_STYLE_GUIDE } = require("./prompt");

async function generateLinkedInPost(certificate) {
  const certificateJson = JSON.stringify(
    certificate,
    null,
    2
  );

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

  // Convert Markdown links into plain URLs
  postText = postText.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    "$2"
  );

  return postText;
}

module.exports = {
  generateLinkedInPost,
};

async function openPostComposer(page) {
  const startPostButton = page.getByRole("button", {
    name: "Start a post",
  });

  await startPostButton.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await startPostButton.scrollIntoViewIfNeeded();

  await page.waitForTimeout(1000);

  await startPostButton.click();

  const composer = page.locator(
    ".share-creation-state__content-scrollable"
  );

  await composer.waitFor({
    state: "visible",
    timeout: 30000,
  });

  console.log("Composer opened");

  return composer;
}

async function fillLinkedInPost(
  composer,
  postText
) {
  const editor = composer.getByRole("textbox", {
    name: "Text editor for creating content",
  });

  await editor.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await editor.fill(postText);

  console.log("Post text filled");
}

async function removeLinkPreview(composer) {
  const removePreviewButton =
    composer.getByRole("button", {
      name: "Remove media",
    });

  await removePreviewButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await removePreviewButton.click();

  console.log("Link preview removed");
}

async function attachCertificate(
  page,
  certificate
) {
  // 1. Click More
  const moreButton = page
    .getByTestId("interop-shadowdom")
    .getByRole("button", {
      name: "More",
    });

  await moreButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await moreButton.click();

  console.log("More options opened");

  // 2. Click Add a document
  const addDocumentButton = page.getByRole(
    "button",
    {
      name: "Add a document",
    }
  );

  await addDocumentButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await addDocumentButton.click();

  console.log("Share a document opened");

  // 3. Click Choose file
  const chooseFile = page.getByText(
    "Choose file",
    {
      exact: true,
    }
  );

  await chooseFile.waitFor({
    state: "visible",
    timeout: 15000,
  });

  const fileChooserPromise =
    page.waitForEvent("filechooser");

  await chooseFile.click();

  const fileChooser =
    await fileChooserPromise;

  // 4. Use PDF path from certificate JSON
  await fileChooser.setFiles(
    certificate.pdfPath
  );

  console.log(
    "Certificate PDF selected"
  );

  // 5. Fill document title
  const documentTitle =
    page.getByRole("textbox", {
      name: "Document title *",
    });

  await documentTitle.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await documentTitle.fill(
    certificate.title
  );

  console.log(
    `Document title filled: ${certificate.title}`
  );

  // 6. Click Done
  const doneButton = page.getByRole(
    "button",
    {
      name: "Done",
    }
  );

  await doneButton.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await doneButton.click();

  console.log(
    "Document attached successfully"
  );
}

async function publishLinkedInPost(page) {
  const postButton = page.getByRole(
    "button",
    {
      name: "Post",
      exact: true,
    }
  );

  await postButton.waitFor({
    state: "visible",
    timeout: 30000,
  });

  await postButton.click();

  console.log(
    "LinkedIn post published"
  );
}

async function prepareLinkedInPost(
  page,
  certificate
) {
  // 1. Generate LinkedIn post
  console.log(
    "Generating LinkedIn post with OpenAI..."
  );

  const postText =
    await generateLinkedInPost(
      certificate
    );

  console.log(
    "\nGenerated LinkedIn post:\n"
  );

  console.log(postText);

  console.log(
    "\n-----------------------------------\n"
  );

  // 2. Open composer
  const composer =
    await openPostComposer(page);

  // 3. Fill generated post
  await fillLinkedInPost(
    composer,
    postText
  );

  // 4. Remove credential URL preview
  await removeLinkPreview(
    composer
  );

  // 5. Attach certificate
  await attachCertificate(
    page,
    certificate
  );

  // 6. Publish
  await publishLinkedInPost(page);

  console.log(
    "LinkedIn post prepared successfully."
  );

  return postText;
}

module.exports = {
  prepareLinkedInPost,
};