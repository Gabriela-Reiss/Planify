import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ContextTheme";

export default function ThemeToggleButton() {
  const { toggleTheme, colors, theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: colors.text }]}
      onPress={toggleTheme}
    >
      <Text style={[styles.icon, { color: colors.text }]}>
        {theme === "light" ? "☾" : "☼"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
