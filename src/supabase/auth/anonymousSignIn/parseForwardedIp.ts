import { forwardedIpSchema } from "@/supabase/auth/anonymousSignIn/forwardedIp.types";

// Takes the IP of an `x-forwarded-for` value, ignoring surrounding spaces.
// On Vercel the value is always overwritten with the single IP of the client.
// So anything that is not a single valid IP (multiple IPs, a port, a string that is not an IP) is abnormal.
// It returns undefined for such a value, the same as for a missing one.
const parseForwardedIp = (
  forwardedForHeader: string | null,
): string | undefined => {
  const result = forwardedIpSchema.safeParse(forwardedForHeader?.trim());

  return result.success ? result.data : undefined;
};

export { parseForwardedIp };
