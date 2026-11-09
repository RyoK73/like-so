import z from "zod";

// A single IPv4 or IPv6 address. Multiple addresses, a port and surrounding spaces are not accepted.
const forwardedIpSchema = z.union([z.ipv4(), z.ipv6()]);

export { forwardedIpSchema };
