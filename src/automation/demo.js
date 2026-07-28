const { launchPortfolio } = require("../portfolio/auth");
const { openSkills, createSkill } = require("../portfolio/skills");
const {
  openCertificates,
  createCertificate,
} = require("../portfolio/certificates");
const { launchCoursera } = require("../coursera/auth");
const { scrapeCertificate } = require("../coursera/scrapper");

(async () => {
  const { page: courseraPage } = await launchCoursera();

  const courseName = "Structuring Machine Learning";
  const certificate = await scrapeCertificate(courseraPage, courseName);

  const { page: portfolioPage } = await launchPortfolio();

  await openSkills(portfolioPage);

  for (const skill of certificate.skills) {
    await createSkill(portfolioPage, skill);
  }

  await openCertificates(portfolioPage);
  await createCertificate(portfolioPage, certificate);
})();


