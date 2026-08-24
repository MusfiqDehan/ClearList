import { expect, test } from "@playwright/test";

test("a user can update their profile details", async ({ page }) => {
  const uniqueEmail = `profile-e2e-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Profile Tester");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.getByRole("button", { name: "Account" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.getByLabel("Full name").fill("Updated Profile Name");
  await page.getByLabel("Phone number").fill("+880 1700 000000");
  await page.getByLabel("Timezone").fill("Asia/Dhaka");
  await page.getByLabel("Avatar image URL").fill("https://example.com/avatar.jpg");
  await page.getByLabel("Bio").fill("A little profile bio.");
  await page.getByRole("button", { name: "Save profile" }).click();

  await expect(page.getByRole("status")).toHaveText("Your profile has been updated.");
  await expect(page.getByRole("heading", { name: "Updated Profile Name" })).toBeVisible();
});
