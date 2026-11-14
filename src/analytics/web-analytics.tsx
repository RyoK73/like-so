"use client";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
const WebAnalytics = () => {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        if (new URL(event.url).pathname.startsWith("/sketches")) {
          return null;
        }
        return event;
      }}
    />
  );
};
export { WebAnalytics };
