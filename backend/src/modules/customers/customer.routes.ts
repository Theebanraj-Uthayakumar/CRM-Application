import { Router } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler";
import type { CustomerController } from "./customer.controller";

export const createCustomerRouter = (controller: CustomerController) => {
  const router = Router();

  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.get));
  router.post("/", asyncHandler(controller.create));
  router.put("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.delete));

  return router;
};
