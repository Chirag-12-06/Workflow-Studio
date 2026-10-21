const { launchLinkedIn } = require("./auth");

async function scrollToLicensesSection(page) {
  const licensesHeading = page.getByRole("heading", {
    name: /^Licenses & certifications/,
  });

  for (let i = 0; i < 15; i++) {
    if (await licensesHeading.isVisible().catch(() => false)) {
      console.log("Licenses & certifications section found");
      return licensesHeading;
    }

    console.log(`Page Down ${i + 1}`);

    await page.keyboard.press("PageDown");
    await page.waitForTimeout(1000);
  }

  throw new Error("Licenses & certifications section not found");
}

function getPlainUrl(url) {
  if (typeof url !== "string") {
    return "";
  }

  const match = url.match(/\((https?:\/\/[^)]+)\)/);

  return match ? match[1] : url;
}

async function addLinkedInSkills(page, skills) {
  const addSkillButton = page.getByRole("button", {
    name: "Add skill",
  });

  await addSkillButton.click();

  for (const skill of skills) {
    const originalSkill = skill.trim();

    if (!originalSkill) continue;

    const searchSkill = originalSkill.toLowerCase();

    console.log(`Checking LinkedIn skill: ${searchSkill}`);

    const skillInput = page.getByRole("textbox", {
      name: "Skill (ex: Project Management)",
    });

    await skillInput.waitFor({
      state: "visible",
      timeout: 10000,
    });

    await skillInput.fill(searchSkill);

    const escapedSkill = searchSkill.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const matchingSkill = page.getByRole("button", {
      name: new RegExp(`^${escapedSkill}$`, "i"),
    });

    try {
      await matchingSkill.first().waitFor({
        state: "visible",
        timeout: 5000,
      });
    } catch {
      console.log(`Skill not found: ${originalSkill}`);
      continue;
    }

    const linkedinSkill = matchingSkill.first();
    const returnedSkill = (await linkedinSkill.innerText()).trim();

    console.log(`LinkedIn returned: ${returnedSkill}`);

    // Preserve the existing rule for filtering lowercase results.
    if (returnedSkill === searchSkill) {
      console.log(`Ignoring lowercase result: ${returnedSkill}`);
      continue;
    }

    await linkedinSkill.click();

    console.log(`Skill selected: ${returnedSkill}`);

    await page.waitForTimeout(500);

    if (await addSkillButton.isVisible().catch(() => false)) {
      await addSkillButton.click();
    }
  }
}

async function addCertificateMedia(page, certificate) {
  await page.getByRole("button", {
    name: "Add media",
  }).click();

  await page.getByText("Add a document", {
    exact: true,
  }).click();

  console.log("Document upload dialog opened");

  const fileInput = page.locator('input[type="file"]').first();

  await fileInput.waitFor({
    state: "attached",
    timeout: 15000,
  });

  await fileInput.setInputFiles(certificate.pdfPath);

  console.log("Certificate PDF selected");

  const documentTitle = page.getByRole("textbox", {
    name: "Title*",
  });

  await documentTitle.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await documentTitle.fill(certificate.title);

  console.log("Document title filled");

  await page.getByRole("button", {
    name: "Save",
  }).click();

  console.log("Media saved");
}

async function testCertificate() {
  const { page, context } = await launchLinkedIn();

  try {
    // Hardcoded test data. No OpenAI call.
    const certificate = {
      title: "Structuring Machine Learning Projects",
      issuer: "DeepLearning.AI",
      issueDate: "2026-10",
      certificateId: "TEST-CERTIFICATE-ID",
      credentialUrl:
        "https://www.coursera.org/account/accomplishments/verify/SODDM9SUNX55",
      pdfPath:
        "D:\\OneDrive\\Desktop\\Certificates\\Structuring Machine Learning Projects.pdf",
      skills: [
        "Machine Learning",
        "Deep Learning",
        "Python",
      ],
    };

    // 1. Open profile.
    await page.getByRole("button", {
      name: "Me",
      exact: true,
    }).click();

    await page.getByRole("link", {
      name: "View profile",
    }).click();

    await page.waitForLoadState("domcontentloaded");

    console.log("LinkedIn profile opened");

    // 2. Find Licenses & certifications.
    await scrollToLicensesSection(page);

    const addCertification = page.getByRole("link", {
      name: "Add a certification",
    });

    await addCertification.waitFor({
      state: "visible",
      timeout: 15000,
    });

    await addCertification.click();

    console.log("Certification form opened");

    // 3. Fill certificate name.
    const nameInput = page.getByRole("textbox", {
      name: "Name*",
    });

    await nameInput.waitFor({
      state: "visible",
      timeout: 15000,
    });

    await nameInput.fill(certificate.title);

    // 4. Fill and select issuer.
    const issuerInput = page.getByRole("textbox", {
      name: "Issuing organization*",
    });

    await issuerInput.fill(certificate.issuer);

    const issuerOption = page.getByRole("option", {
      name: certificate.issuer,
    }).first();

    await issuerOption.waitFor({
      state: "visible",
      timeout: 10000,
    });

    await issuerOption.click();

    console.log("Certificate issuer selected");

    // 5. Fill issue date.
    const [year, month] = certificate.issueDate.split("-");

    await page
      .getByLabel("Issue date month")
      .getByLabel("Month")
      .selectOption(String(Number(month)));

    await page
      .getByLabel("Issue date year")
      .getByLabel("Year")
      .selectOption(year);

    console.log("Issue date filled");

    // 6. Fill credential ID and URL.
    await page.getByRole("textbox", {
      name: "Credential ID",
    }).fill(certificate.certificateId);

    await page.getByRole("textbox", {
      name: "Credential URL",
    }).fill(getPlainUrl(certificate.credentialUrl));

    console.log("Credential details filled");

    // 7. Add skills.
    await addLinkedInSkills(page, certificate.skills);

    console.log("Skills step completed");

    // 8. Attach certificate PDF.
    await addCertificateMedia(page, certificate);

    console.log("\nTEST PASSED: Certificate form and media steps completed.");
    console.log("The final certification form has NOT been submitted.");

    // Keep the browser open for manual inspection.
    // Close it manually when finished.
  } catch (error) {
    console.error("\nCertificate test failed:");
    console.error(error);

    await page.screenshot({
      path: "linkedin-certificate-test-error.png",
      fullPage: false,
    });

    process.exitCode = 1;
  } finally {
    // Intentionally leave the browser open for inspection.
    // Do not close the context automatically.
  }
}

testCertificate();