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
console.log(`Connecting to database`);

const adapter: PrismaPg = new PrismaPg({ connectionString });
const prisma: PrismaClient = new PrismaClient({ adapter });

async function testDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Database connection failed on startup!");
    console.error(error);
  }
}

testDbConnection();

export { prisma };
