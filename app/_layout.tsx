// /app/_layout.tsx
import { Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/configurations/i18nConfig";
import { ThemeProvider } from "../src/context/ContextTheme";

export default function Layout() {
    return (
        <I18nextProvider i18n={i18n}>
            <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
            </ThemeProvider>
        </I18nextProvider>
    );
}
