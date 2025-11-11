import { Prisma } from "../../generated/prisma/client";
import type { Customer as PrismaCustomer, PrismaClient } from "../../generated/prisma/client";
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "./customer.types";

export interface CustomerRepository {
  create(data: CreateCustomerInput): Promise<Customer>;
  findAll(params?: CustomerQuery): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  update(id: string, data: UpdateCustomerInput): Promise<Customer>;
  delete(id: string): Promise<void>;
}

export interface CustomerQuery {
  search?: string;
}

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateCustomerInput) {
    const payload: Prisma.CustomerCreateInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      country: data.country ?? null,
    };

    const record = await this.prisma.customer.create({ data: payload });
    return this.mapToCustomer(record);
  }

  async findAll(params?: CustomerQuery) {
    const search = params?.search?.trim();

    if (search) {
      const query = Prisma.sql`
        SELECT
          "id",
          "firstName",
          "lastName",
          "email",
          "phoneNumber",
          "address",
          "city",
          "state",
          "country",
          "createdAt"
        FROM "Customer"
        WHERE "search_vector" @@ websearch_to_tsquery('english', ${search})
        ORDER BY "createdAt" DESC
      `;

      const records = await this.prisma.$queryRaw<Array<PrismaCustomer>>(query);
      return records.map((record) => this.mapToCustomer(record));
    }

    const records = await this.prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
    return records.map((record) => this.mapToCustomer(record));
  }

  async findById(id: string) {
    const record = await this.prisma.customer.findUnique({ where: { id } });
    return record ? this.mapToCustomer(record) : null;
  }

  async findByEmail(email: string) {
    const record = await this.prisma.customer.findUnique({ where: { email } });
    return record ? this.mapToCustomer(record) : null;
  }

  async update(id: string, data: UpdateCustomerInput) {
    const payload: Prisma.CustomerUpdateInput = {};

    if (data.firstName !== undefined) payload.firstName = data.firstName;
    if (data.lastName !== undefined) payload.lastName = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber ?? null;
    if (data.address !== undefined) payload.address = data.address ?? null;
    if (data.city !== undefined) payload.city = data.city ?? null;
    if (data.state !== undefined) payload.state = data.state ?? null;
    if (data.country !== undefined) payload.country = data.country ?? null;

    const record = await this.prisma.customer.update({ where: { id }, data: payload });
    return this.mapToCustomer(record);
  }

  async delete(id: string) {
    await this.prisma.customer.delete({ where: { id } });
  }

  private mapToCustomer(record: PrismaCustomer): Customer {
    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phoneNumber: record.phoneNumber ?? undefined,
      address: record.address ?? undefined,
      city: record.city ?? undefined,
      state: record.state ?? undefined,
      country: record.country ?? undefined,
      createdAt: record.createdAt,
    };
  }
}
