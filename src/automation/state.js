const fs = require("fs/promises");

const FILE = "./state.json";

async function getLastCertificateId() {
  try {
    const data = JSON.parse(await fs.readFile(FILE, "utf8"));
    return data.lastCertificateId;
  } catch {
    return null;
  }
}

async function setLastCertificateId(id) {
  await fs.writeFile(FILE, JSON.stringify({ lastCertificateId: id }, null, 2));
}

module.exports = {
  getLastCertificateId,
  setLastCertificateId,
};
