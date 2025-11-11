import type { OpenAPIV3_1 } from "openapi-types";

const customerSchema: OpenAPIV3_1.SchemaObject = {
  type: "object",
  required: ["id", "firstName", "lastName", "email", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string", format: "email" },
    phoneNumber: { type: ["string", "null"] },
    address: { type: ["string", "null"] },
    city: { type: ["string", "null"] },
    state: { type: ["string", "null"] },
    country: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
  },
};

const mutationPayloadSchema: OpenAPIV3_1.SchemaObject = {
  type: "object",
  required: ["firstName", "lastName", "email"],
  properties: {
    firstName: { type: "string", minLength: 1 },
    lastName: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
    phoneNumber: { type: ["string", "null"] },
    address: { type: ["string", "null"] },
    city: { type: ["string", "null"] },
    state: { type: ["string", "null"] },
    country: { type: ["string", "null"] },
  },
};

const errorResponse: OpenAPIV3_1.SchemaObject = {
  type: "object",
  properties: {
    message: { type: "string" },
    details: {},
  },
};

export const openApiSpec: OpenAPIV3_1.Document = {
  openapi: "3.0.3",
  info: {
    title: "CRM Customer API",
    description: "REST API for managing customer accounts in the CRM prototype.",
    version: "1.1.0",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  components: {
    schemas: {
      Customer: customerSchema,
      CustomerPayload: mutationPayloadSchema,
      ErrorResponse: errorResponse,
    },
    parameters: {
      CustomerIdParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Customer identifier",
      },
    },
  },
  paths: {
    "/api/customers": {
      get: {
        summary: "List customers",
        description: "Returns customers ordered by creation date. Supports optional full-text search.",
        tags: ["Customers"],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Optional search term applied to name, email, and location fields.",
          },
        ],
        responses: {
          200: {
            description: "Customers fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Customer" },
                },
              },
            },
          },
          500: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create customer",
        tags: ["Customers"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CustomerPayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Customer created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Duplicate email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/customers/{id}": {
      get: {
        summary: "Get customer",
        tags: ["Customers"],
        parameters: [{ $ref: "#/components/parameters/CustomerIdParam" }],
        responses: {
          200: {
            description: "Customer details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          404: {
            description: "Customer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update customer",
        tags: ["Customers"],
        parameters: [{ $ref: "#/components/parameters/CustomerIdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/CustomerPayload" },
                  { required: [] },
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Customer updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Customer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Duplicate email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete customer",
        tags: ["Customers"],
        parameters: [{ $ref: "#/components/parameters/CustomerIdParam" }],
        responses: {
          204: {
            description: "Customer deleted",
          },
          404: {
            description: "Customer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

