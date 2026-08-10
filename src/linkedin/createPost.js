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


async function fillLinkedInPost(page, postText) {
  const composer = await openPostComposer(page);

  const editor = composer.getByRole("textbox", {
    name: "Text editor for creating content",
  });

  await editor.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await editor.fill(postText);

  console.log("Post text filled");

  return composer;
}


async function removeLinkPreview(composer) {
  const removePreviewButton = composer.getByRole("button", {
    name: "Remove media",
  });

  await removePreviewButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await removePreviewButton.click();

  console.log("Link preview removed");
}


async function attachCertificate(page, composer, pdfPath) {
  const addDocumentButton = composer.getByRole("button", {
    name: "Add a document",
  });

  await addDocumentButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  console.log("Add a document button found");

  const fileChooserPromise = page.waitForEvent("filechooser");

  await addDocumentButton.click();

  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles(pdfPath);

  console.log("Certificate PDF selected");
}


module.exports = {
  openPostComposer,
  fillLinkedInPost,
  removeLinkPreview,
  attachCertificate,
};