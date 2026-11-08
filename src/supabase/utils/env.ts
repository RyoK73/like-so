import z from "zod";

const requiredString = (key: string) => {
  return z.string({ error: `${key}が渡されていません` }).min(1, {
    error: `${key}が空です`,
  });
};

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: requiredString("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredString(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ),
});

// Server only. Never add the `NEXT_PUBLIC_` prefix, which would expose the key to the browser.
const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: requiredString("SUPABASE_SECRET_KEY"),
});

const supabaseRemoteEnvSchema = z.object({
  PROJECTID: requiredString("PROJECTID"),
  SUPABASE_ACCESS_TOKEN: requiredString("SUPABASE_ACCESS_TOKEN"),
});

const supabaseLocalEnvSchema = z.object({
  SUPABASE_LOCAL_URL: requiredString("SUPABASE_LOCAL_URL"),
  SUPABASE_LOCAL_ADMIN_KEY: requiredString("SUPABASE_LOCAL_ADMIN_KEY"),
  SUPABASE_LOCAL_ANON_KEY: requiredString("SUPABASE_LOCAL_ANON_KEY"),
  SUPABASE_LOCAL_DB_URL: requiredString("SUPABASE_LOCAL_DB_URL"),
});

const parsePublicEnv = () =>
  publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

const parseServerEnv = () =>
  serverEnvSchema.parse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });

const parseSupabaseRemoteEnv = () =>
  supabaseRemoteEnvSchema.parse({
    PROJECTID: process.env.PROJECTID,
    SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
  });

const parseSupabaseLocalEnv = () =>
  supabaseLocalEnvSchema.parse({
    SUPABASE_LOCAL_URL: process.env.SUPABASE_LOCAL_URL,
    SUPABASE_LOCAL_ADMIN_KEY: process.env.SUPABASE_LOCAL_ADMIN_KEY,
    SUPABASE_LOCAL_ANON_KEY: process.env.SUPABASE_LOCAL_ANON_KEY,
    SUPABASE_LOCAL_DB_URL: process.env.SUPABASE_LOCAL_DB_URL,
  });

export {
  parsePublicEnv,
  parseServerEnv,
  parseSupabaseRemoteEnv,
  parseSupabaseLocalEnv,
};
