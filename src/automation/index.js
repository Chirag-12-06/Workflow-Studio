const fs = require("fs");

const { launchBrowser } = require("../browser/browser");
const PROFILES = require("../browser/profiles");

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
  const pdfResponse = page.waitForResponse((response) =>
    response.url().includes("/api/certificate.v1/pdf/"),
  );

  await page.pause();

  await page
    .getByRole("link", {
      name: "Download Download Certificate",
    })
    .click();

  const response = await pdfResponse;
  const buffer = await response.body();


  fs.writeFileSync(
    `D:\\OneDrive\\Desktop\\Certificates\\${courseName}.pdf`,
    buffer,
  );
}

(async () => {
  const courseName = "Structuring Machine Learning";
  const { page } = await launchBrowser(PROFILES.COURSERA);

  await downloadCertificate(page, courseName);
})();
