import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CustomerTable } from "../CustomerTable";
import type { Customer } from "../../types/customer";

const customers: Customer[] = [
  {
    id: "1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phoneNumber: "123",
    address: "",
    city: "London",
    state: "",
    country: "UK",
    createdAt: new Date("2024-01-01").toISOString(),
  },
];

describe("CustomerTable", () => {
  it("renders customers and handles actions", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<CustomerTable customers={customers} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText(/ada lovelace/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(customers[0]);

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(customers[0]);
  });
});
