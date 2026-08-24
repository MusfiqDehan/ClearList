import { expect, test } from "@playwright/test";

test("a user can create, complete, search, edit, and delete a todo", async ({ page }) => {
  const uniqueEmail = `e2e-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Make room for what matters." })).toBeVisible();

  await page.getByRole("button", { name: "Add task" }).click();
  const addDialog = page.getByRole("dialog", { name: "Add a task" });
  await addDialog.getByLabel("Task title").fill("Prepare release notes");
  await addDialog.getByLabel(/Details/).fill("Document the completed work.");
  await addDialog.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByRole("heading", { name: "Prepare release notes" })).toBeVisible();

  await page.getByRole("button", { name: "Complete Prepare release notes" }).click();
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Prepare release notes" })).toBeVisible();

  await page.getByRole("button", { name: "Edit Prepare release notes" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit task" });
  await editDialog.getByLabel("Task title").fill("Publish release notes");
  await editDialog.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: "Publish release notes" })).toBeVisible();

  await page.getByRole("button", { name: "All" }).click();
  await page.getByLabel("Search tasks").fill("Publish");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("heading", { name: "Publish release notes" })).toBeVisible();

  await page.getByRole("button", { name: "Delete Publish release notes" }).click();
  await expect(page.getByRole("dialog", { name: "Delete this task?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete task" }).click();
  await expect(page.getByText("No tasks match this view.")).toBeVisible();
});
