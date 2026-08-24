import { expect, test, type Page } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("an unauthenticated visitor cannot access the admin panel", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login$/);
});

test("a regular user cannot access the admin panel", async ({ page }) => {
  const uniqueEmail = `admin-e2e-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("Regular E2E User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/app$/);
});

test("an admin can review metrics and manage user accounts", async ({ page, browser }) => {
  await signInAsAdmin(page);

  await expect(page.getByRole("heading", { name: "See the whole picture." })).toBeVisible();
  await expect(page.getByText("Total users", { exact: true })).toBeVisible();
  await expect(page.getByText("Total tasks", { exact: true })).toBeVisible();

  await page.route("**/api/admin/invitations", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Invitation sent successfully." }),
    });
  });
  await page.getByLabel("Invite email address").fill("invitee@example.com");
  await page.getByRole("button", { name: "Send invite" }).click();
  await expect(page.getByRole("status")).toHaveText("Invitation sent successfully.");
  await page.unroute("**/api/admin/invitations");

  await page.getByLabel("Search users").fill("user@example.com");
  await page.getByRole("button", { name: "Search" }).click();
  const userRow = page.getByRole("row").filter({ hasText: "user@example.com" });
  await expect(userRow).toBeVisible();

  if (await userRow.getByText("Inactive", { exact: true }).count()) {
    await userRow.getByRole("button", { name: "Activate" }).click();
    await expect(userRow.getByText("Active", { exact: true })).toBeVisible();
  }

  await userRow.getByRole("button", { name: "Deactivate" }).click();
  await expect(page.getByRole("dialog", { name: "Deactivate this user?" })).toBeVisible();
  await page.getByRole("button", { name: "Deactivate user" }).click();
  await expect(userRow.getByText("Inactive", { exact: true })).toBeVisible();

  await userRow.getByRole("button", { name: "Activate" }).click();
  await expect(page.getByRole("dialog", { name: "Activate this user?" })).toBeVisible();
  await page.getByRole("button", { name: "Activate user" }).click();
  await expect(userRow.getByText("Active", { exact: true })).toBeVisible();

  const uniqueEmail = `delete-admin-e2e-${Date.now()}@example.com`;
  const userContext = await browser.newContext({ baseURL: "http://localhost:3000" });
  const userPage = await userContext.newPage();

  try {
    await userPage.goto("/register");
    await userPage.getByLabel("Name").fill("Delete E2E User");
    await userPage.getByLabel("Email").fill(uniqueEmail);
    await userPage.getByLabel("Password", { exact: true }).fill("password123");
    await userPage.getByLabel("Confirm password").fill("password123");
    await userPage.getByRole("button", { name: "Create account" }).click();
    await expect(userPage).toHaveURL(/\/app$/);
  } finally {
    await userContext.close();
  }

  await page.reload();
  await page.getByLabel("Search users").fill(uniqueEmail);
  await page.getByRole("button", { name: "Search" }).click();
  const deletableUserRow = page.getByRole("row").filter({ hasText: uniqueEmail });
  await expect(deletableUserRow).toBeVisible();
  await deletableUserRow.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog", { name: "Permanently delete this user?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete user permanently" }).click();
  await expect(deletableUserRow).not.toBeVisible();

  let invitationDeleted = false;
  await page.route("**/api/admin/users?status=invited*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: invitationDeleted
          ? []
          : [{
              type: "invitation",
              id: 999,
              name: null,
              email: "pending-ui@example.com",
              is_admin: false,
              is_active: false,
              total_tasks: 0,
              completed_tasks: 0,
              pending_tasks: 0,
              created_at: "2026-08-23T00:00:00.000000Z",
              expires_at: "2026-08-30T00:00:00.000000Z",
            }],
        links: {},
        meta: { current_page: 1, from: invitationDeleted ? null : 1, last_page: 1, links: [], path: "", per_page: 10, to: invitationDeleted ? null : 1, total: invitationDeleted ? 0 : 1 },
      }),
    });
  });
  await page.route("**/api/admin/invitations/999/resend", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Invitation resent successfully." }),
    });
  });
  await page.route("**/api/admin/invitations/999", async (route) => {
    invitationDeleted = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Invitation deleted." }),
    });
  });

  await page.getByRole("button", { name: "Invited", exact: true }).click();
  const invitationRow = page.getByRole("row").filter({ hasText: "pending-ui@example.com" });
  await expect(invitationRow).toBeVisible();
  await invitationRow.getByRole("button", { name: "Reinvite" }).click();
  await expect(page.getByRole("status")).toHaveText("Invitation resent to pending-ui@example.com.");
  await invitationRow.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog", { name: "Delete this invitation?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete invitation" }).click();
  await expect(invitationRow).not.toBeVisible();
});
