async function scrollToLicensesSection(page) {
  const licensesHeading = page.getByText(
    /^Licenses & certifications(?:\s*\(\d+\))?$/,
    { exact: false },
  );

  for (let i = 0; i < 15; i++) {
    console.log(`Page Down ${i + 1}`);

    // Restore focus to the page before scrolling.
    await page.locator("body").click({
      position: { x: 500, y: 300 },
      force: true,
    });

    await page.keyboard.press("PageDown");

    await page.waitForTimeout(1000);

    // Check all matching elements because LinkedIn can nest
    // the section heading inside multiple divs.
    const count = await licensesHeading.count();

    for (let j = 0; j < count; j++) {
      const heading = licensesHeading.nth(j);

      if (await heading.isVisible().catch(() => false)) {
        console.log("✓ Licenses & certifications section found");

        await heading.scrollIntoViewIfNeeded();

        return heading;
      }
    }
  }

  throw new Error(
    "Licenses & certifications section not found after scrolling",
  );
}

function getPlainUrl(url) {
  const match = url.match(/\((https?:\/\/[^)]+)\)/);

  return match ? match[1] : url;
}

async function addLinkedInSkills(page, skills) {
  // Open skill selector for the first skill.
  await page
    .getByRole("button", {
      name: "Add skill",
      exact: true,
    })
    .click();

  for (const skill of skills) {
    const originalSkill = skill.trim();

    if (!originalSkill) continue;

    const searchSkill = originalSkill.toLowerCase();

    console.log(`Checking LinkedIn skill: ${searchSkill}`);

    const skillInput = page.getByRole("textbox", {
      name: "Skill (ex: Project Management)",
    });

    if (!(await skillInput.isVisible().catch(() => false))) {
      console.log(`✗ Skill input unavailable: ${originalSkill}`);
      continue;
    }

    await skillInput.fill(searchSkill);
    await page.waitForTimeout(1000);

    // Check ONLY the top suggestion.
    const suggestions = page.getByRole("button", {
      name: /.+/,
    });

    const matchingSkill = page.getByRole("button", {
      name: new RegExp(
        `^${searchSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i",
      ),
    });

    if (!(await matchingSkill.count())) {
      console.log(`✗ No matching top suggestion: ${originalSkill}`);
      await skillInput.fill("");
      continue;
    }

    // Get the first matching suggestion.
    const topSuggestion = matchingSkill.first();
    const returnedSkill = (await topSuggestion.innerText()).trim();

    console.log(`LinkedIn returned: ${returnedSkill}`);

    // Preserve your original check:
    // Reject the result if it is exactly the lowercase search text.
    if (returnedSkill === searchSkill) {
      console.log(`✗ Ignoring lowercase result: ${returnedSkill}`);
      await skillInput.fill("");
      continue;
    }

    console.log(`✓ Adding LinkedIn skill: ${returnedSkill}`);
    await topSuggestion.click();

    // Reopen the selector only if LinkedIn provides the button.
    const addSkillButton = page.getByRole("button", {
      name: "Add skill",
      exact: true,
    });

    if (await addSkillButton.isVisible().catch(() => false)) {
      await addSkillButton.click();
    }
  }

  console.log("Finished processing LinkedIn skills");
}

async function addCertificateMedia(page, certificate) {
  console.log("Adding certificate media...");

  const dialog = page.getByTestId("dialog");

  await dialog.waitFor({
    state: "visible",
    timeout: 10000,
  });

  // 1. Click Add media using the confirmed locator.
  const addMediaButton = dialog.getByRole("button", {
    name: "Add media",
    exact: true,
  });

  await addMediaButton.scrollIntoViewIfNeeded();
  await addMediaButton.click();

  console.log("Add media clicked");

  // 2. Click Add a document.
  const addDocumentOption = page.getByText("Add a document", {
    exact: true,
  });

  await addDocumentOption.waitFor({
    state: "visible",
    timeout: 10000,
  });

  const fileChooserPromise = page.waitForEvent("filechooser");

  await addDocumentOption.click();

  const fileChooser = await fileChooserPromise;

  // 3. Select the PDF.
  if (!certificate.pdfPath) {
    throw new Error("Missing certificate.pdfPath");
  }

  await fileChooser.setFiles(certificate.pdfPath);

  console.log("PDF selected:", certificate.pdfPath);

  // 4. Fill the verified Title textbox locator.
  const titleInput = page.getByRole("textbox", {
    name: "Title*",
  });

  await titleInput.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await titleInput.fill(certificate.title);

  // 5. Fill Description only when provided.
  if (certificate.description) {
    await page
      .getByRole("textbox", {
        name: "Description",
        exact: true,
      })
      .fill(certificate.description);
  }

  // 6. Save the media attachment.
  // The Add media screen has its own Save button.
  const mediaSaveButton = page.getByRole("button", {
    name: "Save",
    exact: true,
  });

  await mediaSaveButton.click();

  // 7. Wait for the media dialog to close.
  await titleInput.waitFor({
    state: "hidden",
    timeout: 15000,
  });

  console.log("Certificate media saved");
}

async function createLinkedInCertificate(page, certificate) {
  // Open profile menu
  await page
    .getByRole("button", {
      name: "Me",
      exact: true,
    })
    .click();

  console.log("Profile menu opened");

  // Wait for the profile link to appear
  const viewProfileLink = page.getByRole("link", {
    name: "View profile",
  });

  await viewProfileLink.waitFor({
    state: "visible",
    timeout: 15000,
  });

  // Navigate directly using the profile link's href.
  // This avoids clicking an element that LinkedIn may detach during a re-render.
  const profileUrl = await viewProfileLink.getAttribute("href");

  if (!profileUrl) {
    throw new Error("Could not find the LinkedIn profile URL");
  }

  await page.goto(new URL(profileUrl, page.url()).href, {
    waitUntil: "domcontentloaded",
  });

  console.log("LinkedIn profile opened");

  // Scroll to Licenses & certifications
  await scrollToLicensesSection(page);

  const addCertification = page.getByRole("link", {
    name: "Add a certification",
  });

  await addCertification.waitFor({
    state: "visible",
    timeout: 10000,
  });

  await addCertification.click();

  // Wait for certification form
  await page
    .getByRole("textbox", {
      name: "Name*",
    })
    .waitFor();

  // Name
  await page
    .getByRole("textbox", {
      name: "Name*",
    })
    .fill(certificate.title);

  // Issuing organization
  const issuerInput = page.getByRole("textbox", {
    name: "Issuing organization*",
  });

  await issuerInput.fill(certificate.issuer);

  // Select issuer
  await page
    .getByRole("option", {
      name: certificate.issuer,
    })
    .first()
    .click();

  // Issue date
  const [year, month] = certificate.issueDate.split("-");

  const issueMonth = page.getByLabel("Issue date month").getByLabel("Month");

  const issueYear = page.getByLabel("Issue date year").getByLabel("Year");

  await issueMonth.selectOption(String(Number(month)));

  await issueYear.selectOption(year);

  // Credential ID
  await page
    .getByRole("textbox", {
      name: "Credential ID",
    })
    .fill(certificate.certificateId);

  // Credential URL
  const credentialUrl = getPlainUrl(certificate.credentialUrl);

  await page
    .getByRole("textbox", {
      name: "Credential URL",
    })
    .fill(credentialUrl);

  // Add LinkedIn-recognized skills
  console.log("Starting LinkedIn skills...");
  await addLinkedInSkills(page, certificate.skills);

  console.log("Skills completed. Starting certificate media...");
  await addCertificateMedia(page, certificate);

  console.log("Certificate media completed.");

  // Wait for the certification form to become available again.
  const certificateNameInput = page.getByRole("textbox", {
    name: "Name*",
  });

  await certificateNameInput.waitFor({
    state: "visible",
    timeout: 15000,
  });

  const certificationDialog = page.getByTestId("dialog");

  const saveButton = certificationDialog.getByRole("button", {
    name: "Save",
    exact: true,
  });

  await saveButton.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await saveButton.click();

  console.log("✓ Certification form submitted");

  // Wait for LinkedIn to process the submission.
  await page.waitForTimeout(2000);

  // Verify that the certificate title appears on the profile.
  const certificateTitle = page.getByText(certificate.title, {
    exact: true,
  });

  await certificateTitle.first().waitFor({
    state: "visible",
    timeout: 15000,
  });

  console.log(`✓ LinkedIn certificate created: ${certificate.title}`);
}

module.exports = {
  createLinkedInCertificate,
};
