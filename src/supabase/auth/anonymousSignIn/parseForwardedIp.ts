// Takes the first IP of an `x-forwarded-for` value (e.g. "a, b" -> "a").
// Returns undefined when there is no usable first IP. The format of the IP is not validated.
const parseForwardedIp = (value: string | null): string | undefined => {
  const firstIp = value?.split(",")[0]?.trim();

  return firstIp ? firstIp : undefined;
};

export { parseForwardedIp };
