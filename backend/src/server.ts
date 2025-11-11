import env from "./config/env";
import { prisma } from "./config/prisma";
import { createApp } from "./app/app";
import { CustomerService } from "./modules/customers/customer.service";
import { PrismaCustomerRepository } from "./modules/customers/customer.repository";

async function start() {
  const customerRepository = new PrismaCustomerRepository(prisma);
  const customerService = new CustomerService(customerRepository);
  const app = createApp({ customerService });

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.PORT}`);
  });

  const shutdown = async () => {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
