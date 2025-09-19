import { Text, Button, Alert, TextInput, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import TaskCard from "../src/components/TaskCard";
import { useEffect, useState } from "react";
import { deleteUser } from "firebase/auth";
import { auth, collection, addDoc, database, getDocs } from "../src/configurations/firebaseConfig";
import ContextThemeButton from "../src/components/ContextThemeButton";
import { useTheme } from "../src/context/ContextTheme";
import * as Notifications from 'expo-notifications';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  interface Tarefa {
    id: string;
    title: string;
    isChecked: boolean;
  }

  const [listaItems, setListaItems] = useState<Tarefa[]>([]);

  const dispararNotificacao = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lembrete de Tarefas",
        body: "Você tem tarefas pendentes para hoje!"
      },
      trigger: {
        seconds: 2,
        repeats: false,
      } as Notifications.TimeIntervalTriggerInput
    });
  };

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log("Expo Push Token gerado com sucesso: ", token);
      return token;
    } catch (error) {
      console.log("Erro ao gerar token", error);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    })();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notificação recebida: ", notification);
    });

    return () => subscription.remove();
  }, []);

  const realizarLogoff = async () => {
    await AsyncStorage.removeItem('@user');
    router.push('/');
  };

  const excluirConta = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita!",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
                await AsyncStorage.removeItem('@user');
                Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.");
                router.replace('/');
              } else {
                Alert.alert("Erro", "Nenhum usuário logado.");
              }
            } catch (error) {
              console.log("Erro ao excluir conta.");
              Alert.alert("Error", "Não foi possível excluir conta");
            }
          }
        }
      ]
    );
  };

  const salvarItem = async () => {
    try {
      const docRef = await addDoc(collection(database, 'tasks'), {
        title: title,
        isChecked: false
      });
      Alert.alert("Sucesso", "Tarefa salva com sucesso.");
      console.log("Documento Salvo", docRef.id);
      setTitle('');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const buscarItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(database, 'tasks'));
      const items: Tarefa[] = [];
      querySnapshot.forEach((item) => {
        items.push({
          ...item.data(),
          id: item.id
        } as Tarefa);
      });
      setListaItems(items);
    } catch (e) {
      console.log("Error ao buscar os dados:", e);
    }
  };

  useEffect(() => {
    buscarItems();
  }, [listaItems]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <ContextThemeButton />
        <Text style={[styles.texto, { color: colors.text }]}>Seja bem-vindo a Tela Inicial da Aplicação</Text>
        <Button title="Sair da Conta" onPress={realizarLogoff} />
        <Button title="Excluir conta" color='red' onPress={excluirConta} />
        <Button title="Alterar Senha" onPress={() => router.push("/AlterarSenha")} />
        <Button title="Disparar Notificação" onPress={dispararNotificacao} />

        {listaItems.length <= 0 ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={listaItems}
            renderItem={({ item }) => (
              <TaskCard
                title={item.title}
                isChecked={item.isChecked}
                id={item.id}
              />
            )}
          />
        )}

        <TextInput
          placeholder="Digite o nome da tarefa"
          style={[styles.input, {
            backgroundColor: colors.input,
            color: colors.inputText,
          }]}
          placeholderTextColor={colors.placeHolderTextColor}
          value={title}
          onChangeText={(value) => setTitle(value)}
          onSubmitEditing={salvarItem}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  input: {
    backgroundColor: 'lightgray',
    padding: 10,
    fontSize: 15,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 'auto'
  },
  texto: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});