"use client";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
const WebAnalytics = () => {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) => {
        if (event.url.includes("/sketches")) {
          return null;
        }
        return event;
      }}
    />
  );
};
export { WebAnalytics };
