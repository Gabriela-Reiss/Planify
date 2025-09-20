import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/configurations/firebaseConfig";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../src/context/ContextTheme";
import ThemeToggleButton from "../src/components/ContextThemeButton";
import { useTranslation } from "react-i18next";

export default function ScreenRegister() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, theme } = useTheme();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleCadastro = async () => {
    // Validações
    if (!nome || !email || !senha || !confirmSenha) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    if (nome.trim().length < 2) {
      Alert.alert("Atenção", "Nome deve ter pelo menos 2 caracteres!");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Atenção", "Digite um e-mail válido!");
      return;
    }

    if (!validatePassword(senha)) {
      Alert.alert("Atenção", "Senha deve ter pelo menos 6 caracteres!");
      return;
    }

    if (senha !== confirmSenha) {
      Alert.alert("Atenção", "As senhas não coincidem!");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      
      Alert.alert(
        "Sucesso!", 
        "Conta criada com sucesso!",
        [{ text: "OK", onPress: () => router.push("/Home") }]
      );
    } catch (error: any) {
      console.log("Erro no cadastro:", error.message);
      
      let errorMessage = "Não foi possível criar a conta.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "E-mail inválido.";
      }
      
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.themeButtonWrapper}>
            <ThemeToggleButton />
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={[styles.logoContainer, { 
            shadowColor: colors.shadow,
            backgroundColor: colors.cardBackground 
          }]}>
            <Image
              source={require('../assets/logo-planify.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: colors.text }]}>
            {t("Create account")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("Fill in the details to start your journey with Planify")} 🚀
          </Text>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Campo Nome */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t("Full name")}
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }
              ]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>
                  👤
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("Enter your full name")}
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Campo Email */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t("email")}
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }
              ]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>
                  ✉
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("Enter your email")}
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Campo Senha */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t("password")}
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }
              ]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>
                  🔒
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("Enter your password")}
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>
                    {showPassword ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.passwordHint, { color: colors.textMuted }]}>
                {t("Minimum of 6 characters")}
              </Text>
            </View>

            {/* Campo Confirmar Senha */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t("Confirm password")}
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }
              ]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>
                  🔒
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("Confirm your password")}
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={confirmSenha}
                  onChangeText={setConfirmSenha}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>
                    {showConfirmPassword ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão de Cadastro */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                { 
                  backgroundColor: colors.backgroundButton,
                  shadowColor: colors.shadow 
                },
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleCadastro}
              disabled={isLoading}
            >
              <Text style={[styles.registerButtonText, { color: colors.buttonText }]}>
                {isLoading ? 
                t("Creating account...") : t("Create account")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.languageContainer}>
                        <TouchableOpacity
                          style={[styles.languageButton, { 
                              backgroundColor: colors.buttonSecondary,
                              borderColor: colors.border
                            }]}
                          onPress={() => mudarIdioma("pt")}
                        >
                          <Text style={[styles.languageText, { color: colors.buttonSecondaryText }]}>
                            🇧🇷 PT
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.languageButton, { 
                              backgroundColor: colors.buttonSecondary,
                              borderColor: colors.border
                            }]}
                          onPress={() => mudarIdioma("en")}
                        >
                          <Text style={[styles.languageText, { color: colors.buttonSecondaryText }]}>
                            🇺🇸 EN
                          </Text>
                        </TouchableOpacity>
                      </View>

          {/* Link para login */}
          <View style={styles.loginSection}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              {t("Already have an account?")}{' '}
            </Text>
            <Link
              href="/"
              style={[styles.loginLink, { color: colors.primary }]}
            >
              {t("Log in")}
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    marginBottom: 20,
  },
  themeButtonWrapper: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8
  },
  logo: {
    width: 70,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 4,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 50
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 25
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});