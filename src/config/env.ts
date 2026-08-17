import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_KEYCLOAK_URL: z.url(),
  VITE_KEYCLOAK_REALM: z.string().min(1),
  VITE_KEYCLOAK_CLIENT_ID: z.string().min(1),
  MODE: z.enum(["development", "production", "test"]).default("development"),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", z.treeifyError(_env.error));
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
