const { login } = require("../portfolio/auth");
const { createIssuer } = require("../portfolio/issuers");
const { createSkill } = require("../portfolio/skills");
const { createCertificate } = require("../portfolio/certificates");

const { launchCoursera } = require("../coursera/auth");
const {
  downloadCertificate,
  scrapeLatestCertificate,
} = require("../coursera/scrapper");

const { launchLinkedIn } = require("../linkedin/auth");
const { prepareLinkedInPost } = require("../linkedin/createPost");
const { createLinkedInCertificate } = require("../linkedin/certificates");

const { getLastCertificateId, setLastCertificateId } = require("./state");

(async () => {
  const { page, context } = await launchCoursera();

  try {
    // ---------------------------------------
    // 1. Scrape latest Coursera certificate
    // ---------------------------------------

    const certificate = await scrapeLatestCertificate(page);

    console.log("Latest certificate:");
    console.log(certificate);

    // ---------------------------------------
    // 2. Check whether it is new
    // ---------------------------------------

    const lastCertificateId = await getLastCertificateId();

    if (certificate.certificateId === lastCertificateId) {
      console.log("No new certificate found.");
      return;
    }

    console.log("New certificate found:", certificate.title);

    // ---------------------------------------
    // 3. Download certificate PDF
    // ---------------------------------------

    const pdfPath = await downloadCertificate(page, certificate);

    console.log("Certificate downloaded:", pdfPath);

    // Add PDF path to certificate object
    certificate.pdfPath = pdfPath;

    // ---------------------------------------
    // 4. Login to Portfolio
    // ---------------------------------------

    await login();

    // ---------------------------------------
    // 5. Create issuer
    // ---------------------------------------

    const issuer = await createIssuer(certificate.issuer);

    certificate.issuerId = issuer.id;

    // ---------------------------------------
    // 6. Create / resolve skills
    // ---------------------------------------

    const skillIds = [];

    for (const skill of certificate.skills) {
      const resolvedSkill = await createSkill(skill);

      skillIds.push(resolvedSkill.id);
    }

    certificate.skillIds = skillIds;

    // ---------------------------------------
    // 7. Create certificate in Portfolio
    // ---------------------------------------

    await createCertificate(certificate);

    console.log("Certificate added to Portfolio.");

    // ---------------------------------------
    // 8. Open LinkedIn
    // ---------------------------------------

    const { page: linkedInPage, context: linkedInContext } =
      await launchLinkedIn();

    try {
      // ---------------------------------------
      // 9. Generate and publish LinkedIn post
      // ---------------------------------------

      await prepareLinkedInPost(linkedInPage, certificate);

      console.log("LinkedIn post created successfully.");

      // ---------------------------------------
      // 10. Add certificate to LinkedIn profile
      // ---------------------------------------

      await createLinkedInCertificate(linkedInPage, certificate);

      console.log("LinkedIn certificate added successfully.");

      // Keep this while testing
      await linkedInPage.pause();
    } finally {
      await linkedInContext.close();
    }

    // ---------------------------------------
    // 11. Save certificate ID
    // ---------------------------------------

    await setLastCertificateId(certificate.certificateId);

    console.log("New certificate processed successfully.");
  } catch (error) {
    console.error("Certificate automation failed:");

    console.error(error);
  } finally {
    await context.close();
  }
})();
