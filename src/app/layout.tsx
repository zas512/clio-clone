import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Clio Clone",
  description: "This is a clone of Clio"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="h-screen flex flex-col bg-[#090f1d] text-slate-100 w-full overflow-hidden">
        <TopBar />
        <div className="flex flex-1 min-w-0 min-h-0">
          <Sidebar />
          <main className="flex-1 min-w-0 min-h-0 bg-[#0b1320] p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
