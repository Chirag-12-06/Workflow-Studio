async function openSkills(page) {
  await page
    .getByRole("link", {
      name: "Skills",
    })
    .click();
}

async function openAddSkillModal(page) {
  await page
    .getByRole("button", {
      name: /add skill/i,
    })
    .click();
}

async function fillSkillForm(page, skillName) {
  await page.getByLabel("Skill Name").fill(skillName);
//   await page.getByLabel("Category").selectOption("ML");
}

async function saveSkill(page) {
  await page
    .getByRole("button", {
      name: /create skill/i,
    })
    .click();
}

async function waitForDuplicateToast(page) {
  const toast = page
    .locator("[data-sonner-toast]")
    .filter({ hasText: /Skill already exists/i });

  try {
    await toast.waitFor({
      state: "visible",
      timeout: 3000,
    });

    return true;
  } catch {
    return false;
  }
}

async function closeSkillModal(page) {
  await page.getByRole("button", { name: "Cancel" }).click();
}

async function pause(ms = 1000) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function createSkill(page, skill) {
  await openAddSkillModal(page);
  await fillSkillForm(page, skill);
  await saveSkill(page);

  const isDuplicate = await waitForDuplicateToast(page);

  if (isDuplicate) {
    await pause(1500);
    await closeSkillModal(page);
    await pause(500);

    return false;
  }

  await pause(500);
  return true;
}

module.exports = {
  openSkills,
  createSkill,
};
