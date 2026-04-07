import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ModalProvider } from "@/Providers/modal-provider";
import { ToasterProvider } from "@/Providers/toast-provider";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NW Tailor ADMIN",
  description: "WE STITCH FOR YOUR FIT",
};

export default function RootLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ToasterProvider />
          <ModalProvider />
          {children}
        
        </body>
      </html>
    </ClerkProvider>
  );
}