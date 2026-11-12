"use client";
import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { store } from "@/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}