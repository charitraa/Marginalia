import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { queryClient } from "@/lib/api/queryClient";
import { THEME_STORAGE_KEY } from "@/config/constants";

/**
 * Every cross-cutting provider, in one place and in dependency order: data
 * before auth (AuthProvider issues queries), router last so route components
 * can reach all of it.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey={THEME_STORAGE_KEY}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="bottom-right" closeButton richColors />
            <BrowserRouter>{children}</BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
