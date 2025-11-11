import type { Request, Response } from "express";

import type { CustomerService } from "./customer.service";
import { ValidationError } from "../../shared/errors/AppError";

export interface CustomerControllerDeps {
  customerService: CustomerService;
}

export const createCustomerController = ({ customerService }: CustomerControllerDeps) => ({
  list: async (req: Request, res: Response) => {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const params = search ? { search } : undefined;
    const customers = await customerService.list(params);
    res.json(customers);
  },

  get: async (req: Request, res: Response) => {
    const customer = await customerService.get(extractId(req));
    res.json(customer);
  },

  create: async (req: Request, res: Response) => {
    const customer = await customerService.create(req.body);
    res.status(201).json(customer);
  },

  update: async (req: Request, res: Response) => {
    const customer = await customerService.update(extractId(req), req.body);
    res.json(customer);
  },

  delete: async (req: Request, res: Response) => {
    await customerService.delete(extractId(req));
    res.status(204).send();
  },
});

export type CustomerController = ReturnType<typeof createCustomerController>;

const extractId = (req: Request): string => {
  const { id } = req.params as { id?: string };
  if (!id) {
    throw new ValidationError("Customer id is required");
  }
  return id;
};
