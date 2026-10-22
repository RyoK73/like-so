import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/design-system/toast";
import { MyToolTipProvider } from "@/design-system/tool-tip-provider";
import { ThemeProvider } from "@/design-system/theme-provider";
import { Yomogi, Zen_Kurenaido } from "next/font/google";

const yomogi = Yomogi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-yomogi",
});

const zenKurenaido = Zen_Kurenaido({
  variable: "--font-zen-kurenaido",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Like-so - Sketch what words can't say",
  description:
    "Like-soは、思いついたアイデアをその場でスケッチして、そのままLLMに渡せるキャンバスです。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${yomogi.variable} ${zenKurenaido.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Toaster>
            <MyToolTipProvider>{children}</MyToolTipProvider>
          </Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}
