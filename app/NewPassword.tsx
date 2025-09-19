import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../src/configurations/firebaseConfig';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ContextTheme';
import ThemeToggleButton from '../src/components/ContextThemeButton';
import { useTranslation } from 'react-i18next';

export default function NewPassword() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAlterarSenha = async () => {
    if (!novaSenha || !confirmarSenha || !senhaAtual) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    if (!validatePassword(novaSenha)) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    if (senhaAtual === novaSenha) {
      Alert.alert('Atenção', 'A nova senha deve ser diferente da atual!');
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Alert.alert('Erro', 'Nenhum usuário logado.');
        return;
      }

      // Reautentica o usuário
      const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credencial);

      // Atualiza a senha
      await updatePassword(user, novaSenha);
      
      Alert.alert(
        'Sucesso!', 
        'Senha alterada com sucesso!',
        [{ text: "OK", onPress: () => router.push('/Home') }]
      );
      
    } catch (error: any) {
      console.log("Erro ao alterar senha:", error);
      
      let errorMessage = 'Não foi possível alterar a senha.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha atual incorreta.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A nova senha é muito fraca.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por segurança, faça login novamente antes de alterar a senha.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.surfaceBackground }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                ←
              </Text>
            </TouchableOpacity>

            <View style={styles.themeButtonWrapper}>
              <ThemeToggleButton />
            </View>
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={[styles.logoContainer, { 
            shadowColor: colors.shadow,
            backgroundColor: colors.cardBackground 
          }]}>
            <Text style={styles.logoEmoji}>🔐</Text>
          </View>

          {/* Título */}
          <Text style={[styles.title, { color: colors.text }]}>
            Alterar Senha
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Digite sua senha atual e escolha uma nova senha segura
          </Text>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Campo Senha Atual */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Senha Atual
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
                  placeholder="Digite sua senha atual"
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry={!showCurrentPassword}
                  autoComplete="current-password"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.passwordToggle}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>
                    {showCurrentPassword ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Nova Senha */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Nova Senha
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }
              ]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>
                  🆕
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Digite a nova senha"
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry={!showNewPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.passwordToggle}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>
                    {showNewPassword ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.passwordHint, { color: colors.textMuted }]}>
                Mínimo de 6 caracteres
              </Text>
            </View>

            {/* Campo Confirmar Nova Senha */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Confirmar Nova Senha
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder
                }
              ]}>
                <Text style={[styles.inputIcon, { color: colors.textMuted }]}>
                  ✅
                </Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor={colors.placeHolderTextColor}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
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
              {novaSenha && confirmarSenha && (
                <Text style={[
                  styles.passwordMatch,
                  { 
                    color: novaSenha === confirmarSenha 
                      ? colors.success 
                      : colors.error 
                  }
                ]}>
                  {novaSenha === confirmarSenha 
                    ? "✓ Senhas coincidem" 
                    : "✗ Senhas não coincidem"}
                </Text>
              )}
            </View>

            {/* Dicas de Segurança */}
            <View style={[styles.securityTips, { backgroundColor: colors.surfaceBackground }]}>
              <Text style={[styles.securityTitle, { color: colors.primary }]}>
                💡 Dicas para uma senha segura:
              </Text>
              <Text style={[styles.securityTip, { color: colors.textSecondary }]}>
                • Use pelo menos 8 caracteres
              </Text>
              <Text style={[styles.securityTip, { color: colors.textSecondary }]}>
                • Combine letras, números e símbolos
              </Text>
              <Text style={[styles.securityTip, { color: colors.textSecondary }]}>
                • Evite informações pessoais óbvias
              </Text>
            </View>

            {/* Botão de Alterar Senha */}
            <TouchableOpacity
              style={[
                styles.changePasswordButton,
                { 
                  backgroundColor: colors.backgroundButton,
                  shadowColor: colors.shadow 
                },
                isLoading && styles.buttonDisabled
              ]}
              onPress={handleAlterarSenha}
              disabled={isLoading || !senhaAtual || !novaSenha || !confirmarSenha}
            >
              <Text style={[styles.changePasswordButtonText, { color: colors.buttonText }]}>
                {isLoading ? "Alterando senha..." : "Alterar Senha"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão Cancelar */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeButtonWrapper: {
    alignSelf: 'flex-end',
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
  logoEmoji: {
    fontSize: 40,
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
    maxWidth: 300,
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
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordMatch: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  securityTips: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  securityTip: {
    fontSize: 12,
    marginBottom: 2,
    lineHeight: 16,
  },
  changePasswordButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});