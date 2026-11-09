import { parseForwardedIp } from "@/supabase/auth/anonymousSignIn/parseForwardedIp";

describe("parseForwardedIp", () => {
  test.each([
    ["a single IPv4 address", "203.0.113.1", "203.0.113.1"],
    ["the IP without surrounding spaces", "  203.0.113.1  ", "203.0.113.1"],
    ["an IPv6 address", "2001:db8::1", "2001:db8::1"],
  ])("should return %s", (_name, input, expected) => {
    expect(parseForwardedIp(input)).toBe(expected);
  });

  test.each([
    ["null", null],
    ["an empty string", ""],
    ["only spaces", "   "],
    ["an empty first element", ", 198.51.100.2"],
    ["multiple addresses", "203.0.113.1, 198.51.100.2"],
    ["multiple addresses without a space", "203.0.113.1,198.51.100.2"],
    ["a string that is not an IP", "not-an-ip"],
    ["an IPv4 address with a port", "203.0.113.1:8080"],
  ])("should return undefined for %s", (_name, input) => {
    expect(parseForwardedIp(input)).toBeUndefined();
  });
});
