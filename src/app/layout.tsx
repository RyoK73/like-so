import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/design-system/toast";
import { MyToolTipProvider } from "@/design-system/tool-tip-provider";

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
    >
      <body className="min-h-full flex flex-col">
        <Toaster>
          <MyToolTipProvider>{children}</MyToolTipProvider>
        </Toaster>
      </body>
    </html>
  );
}
