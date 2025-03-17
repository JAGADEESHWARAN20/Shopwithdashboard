import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ModalProvider } from "@/Providers/modal-provider";
import { ToasterProvider } from "@/Providers/toast-provider";
import Script from 'next/script';
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

interface DashboardLayoutProps {
  children: ReactNode;
  pageProps?: any;
}

const DashboardLayout = ({ children, pageProps }: DashboardLayoutProps) => {
  return (
    <html lang="en">
      <head>
        <Script strategy="beforeInteractive">
          {`
            window.__NEXT_HYDRATED = true;
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ToasterProvider />
        <ModalProvider />
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          fallbackRedirectUrl="/dashboard" // Changed from signInFallbackRedirectUrl
          {...pageProps}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
};

export default DashboardLayout;