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

export default function ScreenRegister() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { colors, theme } = useTheme();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
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
            Criar Conta
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Preencha os dados para começar sua jornada no Planify 🚀
          </Text>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Campo Nome */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Nome Completo
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
                  placeholder="Digite seu nome completo"
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
                E-mail
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
                  placeholder="Digite seu e-mail"
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
                Senha
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
                  placeholder="Digite sua senha"
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
                Mínimo de 6 caracteres
              </Text>
            </View>

            {/* Campo Confirmar Senha */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Confirmar Senha
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
                  placeholder="Confirme sua senha"
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
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Link para login */}
          <View style={styles.loginSection}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Já tem uma conta?{' '}
            </Text>
            <Link
              href="/"
              style={[styles.loginLink, { color: colors.primary }]}
            >
              Fazer Login
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
    elevation: 8,
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
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});