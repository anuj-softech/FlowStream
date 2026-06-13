import { config } from "dotenv";
import { existsSync } from "fs";
import { defineConfig, env } from "prisma/config";

if (existsSync(".env")) {
  config({ path: ".env" });
} else if (existsSync("../.env")) {
  config({ path: "../.env" });
}

export default defineConfig({
  schema: "schema/schema.prisma",
  migrations: {
    path: "schema/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
