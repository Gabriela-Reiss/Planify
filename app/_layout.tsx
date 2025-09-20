
import { Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/configurations/i18nConfig";
import { ThemeProvider } from "../src/context/ContextTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Layout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
