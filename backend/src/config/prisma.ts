import { PrismaClient } from "../generated/prisma/client";

export const prisma = new PrismaClient();

export type PrismaClientType = typeof prisma;
