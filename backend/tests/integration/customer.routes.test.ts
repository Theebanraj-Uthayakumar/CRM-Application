import request from "supertest";

import { createApp } from "../../src/app/app";
import { CustomerService } from "../../src/modules/customers/customer.service";
import { InMemoryCustomerRepository } from "../utils/inMemoryCustomerRepository";

describe("Customer routes", () => {
  const setup = () => {
    const repository = new InMemoryCustomerRepository();
    const service = new CustomerService(repository);
    const app = createApp({ customerService: service });
    return { app, repository };
  };

  it("performs CRUD operations", async () => {
    const { app } = setup();

    const basePayload = {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    };

    const createResponse = await request(app).post("/api/customers").send(basePayload).expect(201);
    expect(createResponse.body.id).toBeDefined();

    const listResponse = await request(app).get("/api/customers").expect(200);
    expect(listResponse.body).toHaveLength(1);

    const customerId = createResponse.body.id;

    const getResponse = await request(app).get(`/api/customers/${customerId}`).expect(200);
    expect(getResponse.body.email).toBe(basePayload.email);

    const updateResponse = await request(app)
      .put(`/api/customers/${customerId}`)
      .send({ firstName: "Grace" })
      .expect(200);
    expect(updateResponse.body.firstName).toBe("Grace");

    await request(app).delete(`/api/customers/${customerId}`).expect(204);

    await request(app).get(`/api/customers/${customerId}`).expect(404);
  });

  it("validates payloads", async () => {
    const { app } = setup();

    await request(app).post("/api/customers").send({ firstName: "Ada" }).expect(400);
    await request(app).put("/api/customers/123").send({}).expect(400);
  });

  it("supports full-text search queries", async () => {
    const { app } = setup();

    await request(app)
      .post("/api/customers")
      .send({
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
        city: "Arlington",
      })
      .expect(201);

    await request(app)
      .post("/api/customers")
      .send({
        firstName: "Alan",
        lastName: "Turing",
        email: "alan@example.com",
        country: "UK",
      })
      .expect(201);

    const searchResponse = await request(app).get("/api/customers").query({ search: "Grace" }).expect(200);
    expect(searchResponse.body).toHaveLength(1);
    expect(searchResponse.body[0].firstName).toBe("Grace");
  });
});
