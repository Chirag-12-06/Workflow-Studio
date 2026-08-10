const { login } = require("../portfolio/auth");
const { createIssuer } = require("../portfolio/issuers");
const { createSkill } = require("../portfolio/skills");
const { createCertificate } = require("../portfolio/certificates");
const { launchCoursera } = require("../coursera/auth");
const {
  downloadCertificate,
  scrapeLatestCertificate,
} = require("../coursera/scrapper");

const { getLastCertificateId, setLastCertificateId } = require("./state");

(async () => {
  const { page, context } = await launchCoursera();

  try {
    const certificate = await scrapeLatestCertificate(page);

    const lastCertificateId = await getLastCertificateId();

    if (certificate.certificateId === lastCertificateId) {
      console.log("No new certificate found.");
      return;
    }

    await downloadCertificate(page, certificate);

    await login();

    const issuer = await createIssuer(certificate.issuer);
    certificate.issuerId = issuer.id;

    const skillIds = [];

    for (const skill of certificate.skills) {
      const resolvedSkill = await createSkill(skill);
      skillIds.push(resolvedSkill.id);
    }

    certificate.skillIds = skillIds;

    await createCertificate(certificate);

    await setLastCertificateId(certificate.certificateId);

    console.log("New certificate processed.");
  } finally {
    await context.close();
  }
})();
