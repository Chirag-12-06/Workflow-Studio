async function openCertificate(page, courseName) {
  await page.goto("https://www.coursera.org");

  await page
    .getByRole("link", {
      name: "My Learning",
    })
    .click();

  const certificate = page.getByRole("listitem").filter({
    hasText: courseName,
  });

  await certificate
    .getByRole("link", {
      name: "View certificate",
    })
    .click();

  await page.waitForSelector("[data-testid='skills']");
}

async function getSkills(page, courseName) {
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

async function scrapeCertificate(page, courseName) {
  await openCertificate(page, courseName);

  return {
    title: courseName,
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

module.exports = {
  scrapeCertificate,
};
