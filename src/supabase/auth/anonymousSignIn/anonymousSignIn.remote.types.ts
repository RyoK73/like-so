import z from "zod";

const authConfigSchema = z.object({
  external_anonymous_users_enabled: z.boolean(),
});

export { authConfigSchema };
