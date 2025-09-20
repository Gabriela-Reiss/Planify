import { useState, useEffect } from "react";
import { 
  Alert, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Image,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView 
} from "react-native";
import { GoogleAuth } from '../src/configurations/googleConfig';
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { colors, theme } = useTheme();
  const { t, i18n } = useTranslation();

  // Hook do Google Auth
  const { request, response, promptAsync, handleResponse } = GoogleAuth.useGoogleLogin();

  useEffect(() => {
    // Verifica se já existe usuário logado no AsyncStorage
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

  // Processa resposta do Google
  useEffect(() => {
    handleResponse();
  }, [response]);

  // Login email/senha
  const handleLoginUser = async () => {
    if (!email || !password) {
      Alert.alert(t("attention"), t("fillAllFields"));
      return;
    }

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  // Esqueci a senha
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

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.themeButtonWrapper}>
            <ThemeToggleButton />
          </View>
        </View>

        <View style={styles.content}>
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

          <Text style={[styles.title, { color: colors.text }]}>
            {t("login")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("Welcome back to Planify")}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t("email")}
              </Text>
              <View style={[styles.inputWrapper, { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>✉</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("email")}
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {t("password")}
              </Text>
              <View style={[styles.inputWrapper, { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t("password")}
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { 
                  backgroundColor: colors.backgroundButton,
                  shadowColor: colors.shadow 
                }, isLoading && styles.buttonDisabled]}
              onPress={handleLoginUser}
              disabled={isLoading}
            >
              <Text style={[styles.loginButtonText, { color: colors.buttonText }]}>
                {isLoading ? "Entrando..." : t("login")}
              </Text>
            </TouchableOpacity>

           
<TouchableOpacity
  style={[
    styles.googleButton,
    { 
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.buttonSecondary,
      borderColor: colors.border,
      borderWidth: 1,
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: 8,
    }
  ]}
  onPress={() => promptAsync()}
  disabled={!request}
>
  <Image
    source={require('../assets/google-logo.png')}
    style={{ width: 24, height: 24, marginRight: 8 }}
    resizeMode="contain"
  />
  <Text style={{ color: colors.buttonSecondaryText, fontWeight: '500', fontSize: 14 }}>
    {t("Sign in with Google")}
  </Text>
</TouchableOpacity>


            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={forgotPassword}
            >
              <Text style={[styles.forgotPassword, { color: colors.primary }]}>
                {t("forgotPassword")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.languageSection}>
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
          </View>

          <View style={styles.signupSection}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              {t("Don't have an account?")}{' '}
            </Text>
            <Link
              href="ScreemRegister"
              style={[styles.signupLink, { color: colors.primary }]}
            >
              {t("signup")}
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
    paddingBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
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
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
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
  signupSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  }
});