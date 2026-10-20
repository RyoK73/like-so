import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/design-system/toast";
import { MyToolTipProvider } from "@/design-system/tool-tip-provider";
import { ThemeProvider } from "@/design-system/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
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
