import { randomUUID } from "crypto";

import type { CustomerRepository } from "../../src/modules/customers/customer.repository";
import type { CreateCustomerInput, Customer, UpdateCustomerInput } from "../../src/modules/customers/customer.types";
import { NotFoundError } from "../../src/shared/errors/AppError";

type CustomerRecord = Customer;

export class InMemoryCustomerRepository implements CustomerRepository {
  private readonly store = new Map<string, CustomerRecord>();

  async create(data: CreateCustomerInput): Promise<Customer> {
    const customer: Customer = {
      id: randomUUID(),
      createdAt: new Date(),
      ...data,
    };
    this.store.set(customer.id, customer);
    return customer;
  }

  async findAll(params?: { search?: string }): Promise<Customer[]> {
    const items = Array.from(this.store.values());
    const search = params?.search?.toLowerCase();
    if (!search) {
      return items;
    }

    return items.filter((item) => {
      const haystack = [
        item.firstName,
        item.lastName,
        item.email,
        item.city ?? "",
        item.country ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return Array.from(this.store.values()).find((item) => item.email === email) ?? null;
  }

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new NotFoundError("Customer not found");
    }
    const updated: Customer = { ...existing };

    if (data.firstName !== undefined) updated.firstName = data.firstName;
    if (data.lastName !== undefined) updated.lastName = data.lastName;
    if (data.email !== undefined) updated.email = data.email;
    if (data.phoneNumber !== undefined) updated.phoneNumber = data.phoneNumber;
    if (data.address !== undefined) updated.address = data.address;
    if (data.city !== undefined) updated.city = data.city;
    if (data.state !== undefined) updated.state = data.state;
    if (data.country !== undefined) updated.country = data.country;

    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
