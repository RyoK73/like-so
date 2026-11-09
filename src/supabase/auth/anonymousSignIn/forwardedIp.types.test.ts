import { forwardedIpSchema } from "@/supabase/auth/anonymousSignIn/forwardedIp.types";

describe("forwardedIpSchema", () => {
  test.each([
    ["an IPv4 address", "203.0.113.1"],
    ["an IPv6 address", "2001:db8::1"],
    ["the IPv6 loopback address", "::1"],
  ])("should accept %s", (_name, input) => {
    expect(forwardedIpSchema.safeParse(input).success).toBe(true);
  });

  test.each([
    ["an empty string", ""],
    ["multiple addresses", "203.0.113.1, 198.51.100.2"],
    ["multiple addresses without a space", "203.0.113.1,198.51.100.2"],
    ["a string that is not an IP", "not-an-ip"],
    ["an IPv4 address with a port", "203.0.113.1:8080"],
    ["an IPv4 address with surrounding spaces", " 203.0.113.1 "],
  ])("should reject %s", (_name, input) => {
    expect(forwardedIpSchema.safeParse(input).success).toBe(false);
  });
});
