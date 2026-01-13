"use client";

import { SessionProvider } from "next-auth/react";
import ToastProvider from "./Providers/ToastProvider";
import ViewTransitionsProvider from "./Providers/ViewTransitionsProvider";
import ProgressBar from "./Providers/ProgressBar";
import ModeSync from "./Auth/ModeSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ModeSync />
      <ToastProvider />
      <ProgressBar />
      <ViewTransitionsProvider>
        {children}
      </ViewTransitionsProvider>
    </SessionProvider>
  );
}
