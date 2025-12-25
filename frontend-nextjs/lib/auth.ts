import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    // We'll use a simple in-memory storage for better-auth
    // In production, you should use a real database
    provider: "sqlite",
    url: "file:./auth.db",
  },
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {},
  // Configure database options
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
