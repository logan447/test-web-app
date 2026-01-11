"use client";

import { SessionProvider } from "next-auth/react";
import ToastProvider from "./Providers/ToastProvider";
import ViewTransitionsProvider from "./Providers/ViewTransitionsProvider";
import ProgressBar from "./Providers/ProgressBar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      <ProgressBar />
      <ViewTransitionsProvider>
        {children}
      </ViewTransitionsProvider>
    </SessionProvider>
  );
}
