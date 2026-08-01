const api = require("./api");

async function createIssuer(issuer) {
  try {
    const res = await api.post("/issuers/resolve", {
      name: issuer,
    });

    console.log(`✓ Resolved issuer: ${res.data.data.name}`);

    return res.data.data;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createIssuer,
};

