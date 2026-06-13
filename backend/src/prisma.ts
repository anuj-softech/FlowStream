import { config } from "dotenv";
import { existsSync } from "fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

if (existsSync(".env")) {
  config({ path: ".env" });
} else if (existsSync("../.env")) {
  config({ path: "../.env" });
}

const connectionString: string = `${process.env.DATABASE_URL}`;
const adapter: PrismaPg = new PrismaPg({ connectionString });
const prisma: PrismaClient = new PrismaClient({ adapter });

export { prisma };
