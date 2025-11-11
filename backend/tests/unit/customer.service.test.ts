import { randomUUID } from "crypto";

import { CustomerService } from "../../src/modules/customers/customer.service";
import type {
  CustomerRepository,
} from "../../src/modules/customers/customer.repository";
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from "../../src/modules/customers/customer.types";
import { ConflictError, NotFoundError, ValidationError } from "../../src/shared/errors/AppError";

type CustomerRecord = Customer;

class InMemoryCustomerRepository implements CustomerRepository {
  private store = new Map<string, CustomerRecord>();

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

describe("CustomerService", () => {
  const baseInput: CreateCustomerInput = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phoneNumber: "1234567890",
    address: "123 Main St",
    city: "London",
    state: "London",
    country: "UK",
  };

  const setup = () => {
    const repository = new InMemoryCustomerRepository();
    const service = new CustomerService(repository);
    return { repository, service };
  };

  it("creates a customer", async () => {
    const { service } = setup();

    const customer = await service.create(baseInput);

    expect(customer.id).toBeDefined();
    expect(customer.email).toBe(baseInput.email);
  });

  it("throws when email already exists on create", async () => {
    const { service } = setup();

    await service.create(baseInput);

    await expect(service.create(baseInput)).rejects.toBeInstanceOf(ConflictError);
  });

  it("updates customer and validates unique email", async () => {
    const { service } = setup();

    const existing = await service.create(baseInput);
    await service.create({ ...baseInput, email: "other@example.com" });

    await expect(
      service.update(existing.id, { email: "other@example.com" }),
    ).rejects.toBeInstanceOf(ConflictError);

    const updated = await service.update(existing.id, { firstName: "Grace" });
    expect(updated.firstName).toBe("Grace");
  });

  it("throws when updating non-existing customer", async () => {
    const { service } = setup();

    await expect(service.update("unknown", { firstName: "Test" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("validates inputs", async () => {
    const { service } = setup();

    await expect(service.create({ ...baseInput, email: "not-an-email" })).rejects.toBeInstanceOf(ValidationError);
    await expect(service.update("123", {})).rejects.toBeInstanceOf(ValidationError);
  });

  it("caches list results and invalidates after create", async () => {
    const now = new Date();
    const repository: CustomerRepository = {
      create: jest.fn(async (input: CreateCustomerInput) => ({ id: "1", createdAt: now, ...input })),
      findAll: jest.fn(async () => [
        {
          id: "1",
          createdAt: now,
          ...baseInput,
        },
      ]),
      findById: jest.fn(async () => ({
        id: "1",
        createdAt: now,
        ...baseInput,
      })),
      findByEmail: jest.fn(async () => null),
      update: jest.fn(async (_id: string, data: UpdateCustomerInput) => {
        const merged = { ...baseInput, ...data };
        const customer: Customer = {
          id: "1",
          createdAt: now,
          firstName: merged.firstName ?? baseInput.firstName,
          lastName: merged.lastName ?? baseInput.lastName,
          email: merged.email ?? baseInput.email,
          phoneNumber: merged.phoneNumber ?? baseInput.phoneNumber,
          address: merged.address ?? baseInput.address,
          city: merged.city ?? baseInput.city,
          state: merged.state ?? baseInput.state,
          country: merged.country ?? baseInput.country,
        };
        return customer;
      }),
      delete: jest.fn(async () => undefined),
    };

    const service = new CustomerService(repository, { cacheTtlMs: 5_000 });

    await service.list();
    await service.list();
    expect(repository.findAll).toHaveBeenCalledTimes(1);

    await service.create(baseInput);

    await service.list();
    expect(repository.findAll).toHaveBeenCalledTimes(2);
  });
});
