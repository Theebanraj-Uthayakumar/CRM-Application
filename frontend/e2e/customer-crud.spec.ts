import { expect, test } from "@playwright/test";

const sampleCustomer = {
  firstName: "Alan",
  lastName: "Turing",
  email: `alan.turing+${Date.now()}@example.com`,
  city: "Manchester",
  country: "UK",
};

test.describe("Customer CRUD", () => {
  test("allows creating, updating, and deleting a customer", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /add customer/i }).click();

    await page.getByLabel("First name *").fill(sampleCustomer.firstName);
    await page.getByLabel("Last name *").fill(sampleCustomer.lastName);
    await page.getByLabel("Email *").fill(sampleCustomer.email);
    await page.getByLabel("City").fill(sampleCustomer.city);
    await page.getByLabel("Country").fill(sampleCustomer.country);

    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(page.getByRole("cell", { name: new RegExp(sampleCustomer.email, "i") })).toBeVisible();

    await page.getByRole("row", { name: new RegExp(sampleCustomer.email, "i") }).getByRole("button", { name: /edit/i }).click();

    await page.getByLabel("First name *").fill("Alan Mathison");
    await page.getByRole("button", { name: /^save$/i }).click();

    await expect(page.getByRole("cell", { name: /alan mathison turing/i })).toBeVisible();

    await page.getByRole("row", { name: new RegExp(sampleCustomer.email, "i") }).getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: /delete$/i }).click();

    await expect(page.getByRole("cell", { name: new RegExp(sampleCustomer.email, "i") })).not.toBeVisible({ timeout: 5000 });
  });
});
