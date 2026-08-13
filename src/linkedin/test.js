const { launchLinkedIn } = require("./auth");

const certificate = {
  certificateId: "HEER4ZAQIGC2",
  title: "Structuring Machine Learning Projects",
  issuer: "DeepLearning.AI",
  issueDate: "2026-06-26",
  expiryDate: null,
  displayOrder: 1,
  featured: true,
  credentialUrl:
    "[https://www.coursera.org/account/accomplishments/verify/HEER4ZAQIGC2](https://www.coursera.org/account/accomplishments/verify/HEER4ZAQIGC2)",
  badgeImageUrl: null,
  skills: [
    "Applied Machine Learning",
    "Decision Intelligence",
    "AI Product Strategy",
    "Deep Learning",
    "Model Evaluation",
    "Machine Learning",
    "Machine Learning Methods",
    "Model Optimization",
    "Transfer Learning",
    "Debugging",
    "AI Workflows",
    "Model Training",
  ],
};

function getPlainUrl(url) {
  const match = url.match(/\((https?:\/\/[^)]+)\)/);

  return match ? match[1] : url;
}

async function scrollToLicensesSection(page) {
  const licensesSection = page.locator("div").filter({
    hasText: /^Licenses & certifications \(42\)$/,
  });

  for (let i = 0; i < 15; i++) {
    console.log(`Page Down ${i + 1}`);

    // Make sure the page has focus
    await page.locator("body").click({
      position: { x: 500, y: 300 },
    });

    // Scroll like a real user
    await page.keyboard.press("PageDown");

    // Give LinkedIn time to lazy-load the next section
    await page.waitForTimeout(1500);

    if (await licensesSection.count()) {
      console.log("✓ Licenses & certifications section loaded");

      return licensesSection.last();
    }
  }

  throw new Error(
    "Licenses & certifications section did not load after scrolling",
  );
}

async function createLinkedInCertificate(page, certificate) {
  // Open profile menu
  await page.getByRole("button", { name: "Me", exact: true }).click();

  // Open profile
  await page.getByRole("link", { name: "View profile" }).click();

  await page.waitForLoadState("domcontentloaded");

  // Scroll down until "Add a certification" becomes available
  await scrollToLicensesSection(page);

  console.log(
    "Add certification links:",
    await page
      .getByRole("link", {
        name: "Add a certification",
      })
      .count(),
  );

  console.log(
    "Add certification text:",
    await page
      .getByText("Add a certification", {
        exact: true,
      })
      .count(),
  );

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

// Select first matching issuer suggestion
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

  // Intentionally not adding skills yet.
  // Pause here so the form can be inspected manually.
  // await page.pause();

  // Add media
  await page
    .getByRole("button", {
      name: "Add media",
    })
    .click();

  // Add a document
  await page
    .getByText("Add a document", {
      exact: true,
    })
    .click();

  // Certificate PDF
  const pdfPath =
    "D:\\OneDrive\\Desktop\\Certificates\\Structuring Machine Learning Projects.pdf";

  // Find LinkedIn's file input
  const fileInput = page.locator('input[type="file"]');

  await fileInput.waitFor({
    state: "attached",
    timeout: 10000,
  });

  await fileInput.setInputFiles(pdfPath);

  // Fill document title
  await page
    .getByRole("textbox", {
      name: "Title*",
    })
    .fill(certificate.title);

  // Save media
  await page
    .getByRole("button", {
      name: "Save",
    })
    .click();

  // Save certification
  await page
    .getByRole("button", {
      name: "Save",
    })
    .click();

  await page.pause();
}

(async () => {
  try {
    const { page } = await launchLinkedIn();

    await createLinkedInCertificate(page, certificate);
  } catch (error) {
    console.error("LinkedIn certificate creation failed:");
    console.error(error);
  }
})();
