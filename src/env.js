// src/env.js
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string().url(),
    API_KEY: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().startsWith('G-'),
    NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
  },
  runtimeEnv: process.env,
});
