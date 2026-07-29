const { launchPortfolio } = require("../portfolio/auth");
const { openSkills, createSkill } = require("../portfolio/skills");
const {
  openCertificates,
  createCertificate,
} = require("../portfolio/certificates");
const { launchCoursera } = require("../coursera/auth");
const { openCertificate, scrapeCertificate } = require("../coursera/scrapper");

(async () => {
  const courseNames = [
  ];

  const { page: courseraPage } = await launchCoursera();
  const { page: portfolioPage } = await launchPortfolio();

  await openCertificate(courseraPage);
  await openSkills(portfolioPage);

  for (const courseName of courseNames) {
    const certificate = await scrapeCertificate(courseraPage, courseName);
    await openSkills(portfolioPage);

    for (const skill of certificate.skills) {
      await createSkill(portfolioPage, skill);
    }

    await openCertificates(portfolioPage);
    await createCertificate(portfolioPage, certificate);
  }
})();
