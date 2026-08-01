const api = require("./api");

async function createCertificate(certificate) {
  const payload = {
    title: certificate.title,
    issuerId: certificate.issuerId,
    credentialUrl: certificate.credentialUrl,
    featured: certificate.featured ?? false,
    issueDate: certificate.issueDate,
    skillIds: certificate.skillIds,
  };

  const res = await api.post("/certificates", payload);

  console.log(`✓ Created certificate: ${certificate.title}`);

  return res.data.data;
}

module.exports = {
  createCertificate,
};