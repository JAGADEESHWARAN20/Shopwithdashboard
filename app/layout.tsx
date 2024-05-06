
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs' 
import { ModalProvider } from "@/Providers/modal-provider";
import { ToasterProvider } from "@/Providers/toast-provider";

import Script from 'next/script';
import { ReactNode } from "react";

// Place this component in your page or layout component
<Script strategy="beforeInteractive">
  {`
    window.__NEXT_HYDRATED = true;
  `}
</Script>

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

interface DashboardLayoutProps {
  children: ReactNode;
  pageProps?: any; // Adjust the type of pageProps if known
}

const DashboardLayout = ({ children, pageProps }: DashboardLayoutProps) => {
  return (

    <html lang="en">
         <body className={inter.className}>
          <ToasterProvider/>
          <ModalProvider/>
        <ClerkProvider {...pageProps}>
          {children}
        </ClerkProvider>
         </body>
      </html>

    

  );
}

export default DashboardLayout;