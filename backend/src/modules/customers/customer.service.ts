import { z } from "zod";

import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors/AppError";
import type { CreateCustomerInput, Customer, UpdateCustomerInput } from "./customer.types";
import type { CustomerRepository, CustomerQuery } from "./customer.repository";

const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string().nullish(),
});

const updateCustomerSchema = createCustomerSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided",
  },
);

interface CustomerServiceOptions {
  cacheTtlMs?: number;
}

class CustomerCache {
  private readonly store = new Map<string, { expiresAt: number; data: Customer[] }>();
  private readonly ttlMs: number;

  constructor(ttlMs = 30_000) {
    this.ttlMs = ttlMs;
  }

  get(key: string): Customer[] | null {
    const cached = this.store.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return cached.data;
  }

  set(key: string, data: Customer[]) {
    this.store.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }

  clear() {
    this.store.clear();
  }
}

export class CustomerService {
  private readonly cache: CustomerCache;

  constructor(
    private readonly repository: CustomerRepository,
    options: CustomerServiceOptions = {},
  ) {
    this.cache = new CustomerCache(options.cacheTtlMs);
  }

  async create(data: CreateCustomerInput): Promise<Customer> {
    const payload = this.safeParse(createCustomerSchema, data);

    const existing = await this.repository.findByEmail(payload.email);
    if (existing) {
      throw new ConflictError("Email already exists");
    }

    const customer = await this.repository.create(payload);
    this.cache.clear();
    return customer;
  }

  async list(params?: CustomerQuery): Promise<Customer[]> {
    const cacheKey = JSON.stringify({ search: params?.search?.trim() || null });
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const customers = await this.repository.findAll(params);
    this.cache.set(cacheKey, customers);
    return customers;
  }

  async get(id: string): Promise<Customer> {
    const customer = await this.repository.findById(id);
    if (!customer) {
      throw new NotFoundError(`Customer with id ${id} not found`);
    }
    return customer;
  }

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const payload = this.safeParse(updateCustomerSchema, data);

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Customer with id ${id} not found`);
    }

    if (payload.email && payload.email !== existing.email) {
      const emailOwner = await this.repository.findByEmail(payload.email);
      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictError("Email already exists");
      }
    }

    const updated = await this.repository.update(id, payload);
    this.cache.clear();
    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Customer with id ${id} not found`);
    }

    await this.repository.delete(id);
    this.cache.clear();
  }

  private safeParse<T>(schema: z.Schema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError("Invalid payload", result.error.flatten());
    }
    return result.data;
  }
}
