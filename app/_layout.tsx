// /app/_layout.tsx
import { Stack } from "expo-router";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/configurations/i18nConfig";

export default function Layout() {
    return (
        <I18nextProvider i18n={i18n}>
            <Stack screenOptions={{ headerShown: false }} />
        </I18nextProvider>
    );
}
