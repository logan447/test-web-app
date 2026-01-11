"use client";

import { SessionProvider } from "next-auth/react";
import ToastProvider from "./Providers/ToastProvider";
import ViewTransitionsProvider from "./Providers/ViewTransitionsProvider";
import NavigationTransitions from "./Providers/NavigationTransitions";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      <ViewTransitionsProvider>
        <NavigationTransitions>
          {children}
        </NavigationTransitions>
      </ViewTransitionsProvider>
    </SessionProvider>
  );
}
