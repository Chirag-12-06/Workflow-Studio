const api = require("./api");

async function createSkill(skill) {
  try {
    const res = await api.post("/skills/resolve", {
      name: skill,
      category: "MACHINE_LEARNING",
    });

    console.log(`✓ Resolved skill: ${res.data.data.name}`);

    return res.data.data;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createSkill,
};
