const fs = require("fs");

async function openLatestCertificate(page) {
  await page.goto(
    "https://www.coursera.org/my-learning?myLearningTab=CERTIFICATES",
    {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    },
  );
  await page
    .getByRole("listitem")
    .nth(4)
    .getByRole("link", { name: "View certificate" })
    .click();

  await page.waitForSelector("[data-testid='skills']");
}

async function getTitle(page) {
  const title = await page.locator("h2").first().textContent();
  return title.trim();
}

async function getSkills(page) {
  const skills = await page
    .getByTestId("skills")
    .locator("li span[aria-hidden='true']")
    .allTextContents();

  await page.waitForTimeout(3000); // 3 seconds

  return skills;
}

async function getIssuer(page) {
  return (await page.locator(".partner-desc a").textContent()).trim();
}

async function getIssueDate(page) {
  const text = (
    await page.locator(".user-course-details p strong").first().innerText()
  ).trim();

  return new Date(text).toISOString().split("T")[0];
}

async function scrapeCertificate(page) {
  const certificateId = page.url().split("/").pop();

  return {
    certificateId,
    title: await getTitle(page),
    issuer: await getIssuer(page),
    issueDate: await getIssueDate(page),
    expiryDate: null,
    displayOrder: 1,
    featured: true,
    credentialUrl: page.url(),
    badgeImageUrl: null,
    skills: await getSkills(page),
  };
}

async function downloadCertificate(page, certificate) {
  const pdfUrl = `https://www.coursera.org/api/certificate.v1/pdf/${certificate.certificateId}`;

  // Build Cookie header
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  const response = await fetch(pdfUrl, {
    headers: {
      Cookie: cookieHeader,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
      Accept: "application/pdf,*/*",
      Referer: page.url(),
    },
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  console.log("Downloaded:", buffer.length, "bytes");

  fs.writeFileSync(
    `D:\\OneDrive\\Desktop\\Certificates\\${certificate.title}.pdf`,
    buffer,
  );
}

async function scrapeLatestCertificate(page) {
  await openLatestCertificate(page);

  const certificate = await scrapeCertificate(page);
  return certificate;
}

module.exports = {
  downloadCertificate,
  scrapeLatestCertificate,
};
