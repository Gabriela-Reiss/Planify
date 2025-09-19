import { useState, useEffect } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../src/configurations/firebaseConfig";
import { useTheme } from "../src/context/ContextTheme";
import { useTranslation } from "react-i18next";
import ThemeToggleButton from "../src/components/ContextThemeButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  // Verifica se usuário já está logado
  useEffect(() => {
    const verificarUsuarioLogado = async () => {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("@user");
        if (usuarioSalvo) {
          router.push("/Home");
        }
      } catch (error) {
        console.log("Erro ao verificar login:", error);
      }
    };

    verificarUsuarioLogado();
  }, []);

  // Login
  const handleLoginUser = async () => {
    if (!email || !password) {
      Alert.alert(t("attention"), t("fillAllFields"));
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      router.push("/Home");
    } catch (error: any) {
      console.log("Mensagem de erro:", error.message);
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        Alert.alert("Erro", t("invalidCredentials"));
      } else {
        Alert.alert("Erro", error.message);
      }
    }
  };

  // Recuperar senha
  const forgotPassword = async () => {
    if (!email) {
      Alert.alert(t("attention"), t("enterEmailToRecover"));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(t("success"), t("resetEmailSent"));
    } catch (error: any) {
      console.log("Erro ao enviar email:", error.message);
      Alert.alert("Erro", t("resetEmailError"));
    }
  };

  // Mudar idioma
  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require("../assets/logo-planify.png")} style={styles.logo} resizeMode="contain" />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{t("login")}</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          placeholder={t("email")}
          placeholderTextColor={colors.placeHolderTextColor}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          placeholder={t("password")}
          placeholderTextColor={colors.placeHolderTextColor}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.backgroundButton }]} onPress={handleLoginUser}>
          <Text style={styles.buttonText}>{t("login")}</Text>
        </TouchableOpacity>

        {/* Botões de Idioma */}
        <View style={styles.languageContainer}>
          <TouchableOpacity style={styles.languageButton} onPress={() => mudarIdioma("pt")}>
            <Text style={styles.languageText}>PT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.languageButton} onPress={() => mudarIdioma("en")}>
            <Text style={styles.languageText}>EN</Text>
          </TouchableOpacity>
        </View>

        <Link href="Cadastrar" style={[styles.buttonLinkText, { color: colors.text }]}>
          {t("singup")}
        </Link>

        <Text style={[styles.forgotPassword, { color: colors.text }]} onPress={forgotPassword}>
          {t("forgotPassword")}
        </Text>

        <ThemeToggleButton />
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 200,
    height: 150,
    marginBottom: 20,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  buttonLinkText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },
  forgotPassword: {
    marginTop: 15,
    fontSize: 14,
    textAlign: "center",
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  languageButton: {
    backgroundColor: "#1E1E1E",
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  languageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
