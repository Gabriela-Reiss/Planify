
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { auth } from '../src/configurations/firebaseConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLoginUser = async () => {
        if (!email || !password) {
            Alert.alert('Por favor, preencha todos os campos');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await AsyncStorage.setItem('@user', JSON.stringify(user));
            router.push('/Home');
        } catch (error: any) {
            console.log("Mensagem de erro:", error.message);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                Alert.alert("Erro", "Email ou senha inválidos");
            } else {
                Alert.alert("Erro", error.message);
            }
        }
    }

    return (
  <View style={styles.container}>
    <Image 
      source={require('../assets/logo-planify.png')} 
      style={styles.logo} 
      resizeMode="contain"
    />

    <View style={styles.content}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLoginUser}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <Link href="Cadastrar" style={styles.buttonLinkText}>
        Ainda não possui uma conta? Cadastre-se já!
      </Link>
    </View>
  </View>
)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    alignItems: "center",
    justifyContent: "center", // centraliza TUDO verticalmente
    paddingHorizontal: 30,
  },
  logo: {
    width: 200,
    height: 150,
    marginBottom: 20, // espaço entre logo e conteúdo
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#da53b6",
  },
  input: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    color: "#3b3d5c",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    backgroundColor: "#da53b6",
    shadowColor: "#6c63ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
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
    color: "#000",
    fontWeight: "400",
    textAlign: "center",
  },
});
