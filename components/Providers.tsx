"use client";

import { SessionProvider } from "next-auth/react";
import ToastProvider from "./Providers/ToastProvider";
import ViewTransitionsProvider from "./Providers/ViewTransitionsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      <ViewTransitionsProvider>
        {children}
      </ViewTransitionsProvider>
    </SessionProvider>
  );
}
