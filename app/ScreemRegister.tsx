import React, { useState } from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,KeyboardAvoidingView,Platform,ScrollView,} from "react-native";
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

  const router = useRouter();
  const { colors } = useTheme(); // pega as cores do tema

  const handleCadastro = () => {
    if (!nome || !email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    createUserWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        router.push("/Home");
      })
      .catch((error) => {
        console.log("Erro no cadastro:", error.message);
        Alert.alert("Erro", "Não foi possível criar a conta.");
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Botão de tema no canto superior esquerdo */}
          <View style={styles.themeButtonContainer}>
            <ThemeToggleButton />
          </View>

          <Text style={[styles.titulo, { color: colors.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitulo, { color: colors.subtext }]}>
            Preencha os campos abaixo para começar 🚀
          </Text>

          {/* Nome */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            placeholder="Nome completo"
            placeholderTextColor={colors.placeholder}
            value={nome}
            onChangeText={setNome}
          />

          {/* Email */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            placeholder="E-mail"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Senha */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            placeholder="Senha"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          {/* Botão */}
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: colors.primary }]}
            onPress={handleCadastro}
          >
            <Text style={styles.textoBotao}>Cadastrar</Text>
          </TouchableOpacity>

          <Link href="/" style={[styles.textoRodape, { color: colors.subtext }]}>
            Já tem uma conta? Faça login na tela inicial.
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },
  themeButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 1,
  },
  botao: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  textoRodape: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
