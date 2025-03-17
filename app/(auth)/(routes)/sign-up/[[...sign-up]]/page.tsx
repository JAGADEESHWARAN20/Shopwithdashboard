'use client'
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp forceRedirectUrl="/dashboard" path="/sign-up" />;
}