'use client'
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp fallbackRedirectUrl="/dashboard" path="/sign-up" />;
}