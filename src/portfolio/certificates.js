async function openCertificates(page) {
  await page
    .getByRole("link", {
      name: "Certificates",
    })
    .click();
}

async function openAddCertificateModal(page) {
  await page
    .getByRole("button", {
      name: /add certificate/i,
    })
    .click();
}

async function fillBasicInformation(page, certificate) {
  await page.getByLabel("Title").fill(certificate.title);

  await page.getByLabel("Issuer").selectOption({
    label: certificate.issuer,
  });

  if (certificate.issueDate) {
    await page.getByLabel("Issue Date").fill(certificate.issueDate);
  }

  if (certificate.expiryDate) {
    await page.getByLabel("Expiry Date").fill(certificate.expiryDate);
  }

  if (certificate.displayOrder !== undefined) {
    await page
      .getByLabel("Display Order")
      .fill(String(certificate.displayOrder));
  }

  if (certificate.featured) {
    await page.getByLabel("Featured Certificate").check();
  }
}

async function fillLinks(page, certificate) {
  if (certificate.credentialUrl) {
    await page
      .getByLabel("Credential URL")
      .fill(certificate.credentialUrl);
  }

  if (certificate.badgeImageUrl) {
    await page
      .getByLabel("Badge Image URL")
      .fill(certificate.badgeImageUrl);
  }
}

async function selectSkills(page, skills = []) {
  for (const skill of skills) {
    await page
      .getByRole("checkbox", {
        name: skill,
        exact: true,
      })
      .check();
  }
}

async function saveCertificate(page) {
  await page
    .getByRole("button", {
      name: /create certificate/i,
    })
    .click();
}

async function pause(ms = 500) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function createCertificate(page, certificate) {
  await openAddCertificateModal(page);

  await fillBasicInformation(page, certificate);
  pause(500);
  await fillLinks(page, certificate);
  pause(500);
  await selectSkills(page, certificate.skills);

  await saveCertificate(page);

  await pause();
}

module.exports = {
  openCertificates,
  createCertificate,
};