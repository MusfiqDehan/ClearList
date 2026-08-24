import { expect, test } from "@playwright/test";

test("Gemini assistant can manage tasks and request delete approval", async ({ page }) => {
  test.setTimeout(120_000);
  test.skip(process.env.RUN_GEMINI_E2E !== "true", "Set RUN_GEMINI_E2E=true to spend Gemini quota.");

  const uniqueEmail = `assistant-${Date.now()}@example.com`;
  const title = `Assistant task ${Date.now()}`;
  const dueDate = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  await page.goto("/register");
  await page.getByLabel("Name").fill("Assistant Tester");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("button", { name: "Open task assistant" }).click();
  await expect(page.getByRole("heading", { name: "Ask your task assistant" })).toBeVisible();

  const assistantInput = page.getByLabel("Ask the task assistant");
  await assistantInput.fill(`Create a task called "${title}" with due date ${dueDate}`);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 45_000 });

  const todoPayload = await page.evaluate(async () => {
    const response = await fetch("http://localhost:8000/api/todos", {
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    return response.json();
  });
  const createdTodo = todoPayload.data.find((todo: { title: string }) => todo.title === title);
  expect(createdTodo).toBeTruthy();

  for (const question of [
    "How many total tasks do I have?",
    "How many tasks have I completed?",
    "How many tasks are due today?",
    "How many tasks are due tomorrow?",
  ]) {
    await assistantInput.fill(question);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".assistant-message-assistant").last()).not.toHaveText(
      "I can manage your Clearlist tasks and answer questions about them. What should we do?",
      { timeout: 45_000 },
    );
  }

  await assistantInput.fill(`Mark task ID ${createdTodo.id} as completed`);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("heading", { name: title })).toHaveClass(/line-through/, { timeout: 45_000 });

  await assistantInput.fill(`Delete task ID ${createdTodo.id}`);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Confirm task deletion" })).toBeVisible({ timeout: 45_000 });
  await page.getByRole("alert").getByRole("button", { name: "Keep task" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByRole("button", { name: "Reset conversation" }).click();
  await expect(
    page.getByText("I can manage your Clearlist tasks and answer questions about them. What should we do?"),
  ).toBeVisible();
  await expect(assistantInput).toHaveValue("");
});
