const { login } = require("../portfolio/auth");
const { createIssuer } = require("../portfolio/issuers");
const { createSkill } = require("../portfolio/skills");
const { createCertificate } = require("../portfolio/certificates");
const { launchCoursera } = require("../coursera/auth");
const { processCertificate } = require("../coursera/scrapper");

(async () => {
  const courseName = "Structuring Machine Learning";

  const { page } = await launchCoursera();
  try {
    const certificate = await processCertificate(page, courseName);

    await login();

    // Resolve issuer
    const issuer = await createIssuer(certificate.issuer);
    certificate.issuerId = issuer.id;

    // Resolve skills
    const skillIds = [];

    for (const skill of certificate.skills) {
      const resolvedSkill = await createSkill(skill);
      skillIds.push(resolvedSkill.id);
    }

    certificate.skillIds = skillIds;

    // Create certificate
    await createCertificate(certificate);
  } finally {
    await context.close();
  }
})();
