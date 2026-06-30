const { chromium } = require("playwright");
const fs = require("fs");

async function downloadCertificate(page, courseName) {
  await page.goto("https://www.coursera.org");

  await page.getByRole("link", { name: "My Learning" }).click();

  const certificate = page.getByRole("listitem").filter({
    hasText: courseName,
  });

  await certificate
    .getByRole("link", {
      name: "View certificate",
    })
    .click();

  await page
    .getByRole("link", { name: "Download Download Certificate" })
    .click();

  page.on("response", async (response) => {
    const url = response.url();

    if (url.includes("/api/certificate.v1/pdf/")) {
      const pdfResponse = await page.context().request.get(url);

      const buffer = await pdfResponse.body();

      fs.writeFileSync(
        `D:\\OneDrive\\Desktop\\Certificates\\${courseName}.pdf`,
        buffer,
      );
    }
  });
}

(async () => {
  const browser = await chromium.launchPersistentContext(
    "./automation-profile",
    {
      channel: "chrome",
      headless: false,
    },
  );
  
  const courseName = "Structuring Machine Learning";
  const page = browser.pages()[0];

  await downloadCertificate(page, courseName);
})();
