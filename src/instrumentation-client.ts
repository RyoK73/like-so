import { initBotId } from "botid/client/core";

// Attach the BotID headers to the Server Action that starts anonymous sign-in.
// A Server Action is sent as a POST to the path of the page that calls it.
// Only the landing page ("/") can reach anonymous sign-in, because `proxy.ts` redirects signed-out users away from "/sketches".
initBotId({ protect: [{ path: "/", method: "POST" }] });
