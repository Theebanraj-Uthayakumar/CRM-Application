import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { errorHandler } from "../middleware/errorHandler";
import { notFoundHandler } from "../middleware/notFoundHandler";
import { openApiSpec } from "../docs/openapi";
import { createCustomerController } from "../modules/customers/customer.controller";
import { createCustomerRouter } from "../modules/customers/customer.routes";
import type { CustomerService } from "../modules/customers/customer.service";

export interface AppDependencies {
  customerService: CustomerService;
}

export const createApp = ({ customerService }: AppDependencies) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const controller = createCustomerController({ customerService });
  app.use("/api/customers", createCustomerRouter(controller));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get("/docs.json", (_req, res) => res.json(openApiSpec));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
