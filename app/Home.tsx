import { Text, Alert, TextInput, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View, TouchableOpacity,StatusBar,Modal} from "react-native";
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
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [userName, setUserName] = useState('Usuário');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          onPress: async () => {
            await AsyncStorage.removeItem('@user');
            router.push('/');
          }
        }
      ]
    );
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
            } catch (error: any) {
              console.log("Erro ao excluir conta.");
              Alert.alert("Error", "Não foi possível excluir conta");
            }
          }
        }
      ]
    );
  };

  const salvarItem = async () => {
    if (!title.trim()) {
      Alert.alert("Atenção", "Digite uma descrição para a tarefa!");
      return;
    }

    try {
      const docRef = await addDoc(collection(database, 'tasks'), {
        title: title.trim(),
        isChecked: false
      });
      
      // Adiciona a nova tarefa diretamente na lista local (otimização)
      const novaTarefa: Tarefa = {
        id: docRef.id,
        title: title.trim(),
        isChecked: false
      };
      
      setListaItems(prev => [...prev, novaTarefa]);
      setTitle('');
      setShowNewTaskModal(false);
      
      console.log("Documento Salvo", docRef.id);
    } catch (e: any) {
      console.error("Error adding document: ", e);
      Alert.alert("Erro", "Não foi possível salvar a tarefa.");
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
    } catch (e: any) {
      console.log("Error ao buscar os dados:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar uma tarefa específica (será usada pelo TaskCard)
  const atualizarTarefa = (id: string, dadosAtualizados: Partial<Tarefa>) => {
    setListaItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...dadosAtualizados } : item
      )
    );
  };

  // Função para remover uma tarefa específica (será usada pelo TaskCard)
  const removerTarefa = (id: string) => {
    setListaItems(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.displayName || user.email?.split('@')[0] || 'Usuário');
        }
      } catch (error) {
        console.log("Erro ao carregar dados do usuário:", error);
      }
    };

    loadUserData();
    buscarItems();
  }, []); // Removido listaItems da dependência

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getTaskStats = () => {
    const total = listaItems.length;
    const completed = listaItems.filter(item => item.isChecked).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const stats = getTaskStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {userName}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <ContextThemeButton />
              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: colors.surfaceBackground }]}
                onPress={() => setShowMenuModal(true)}
              >
                <Text style={[styles.menuButtonText, { color: colors.text }]}>
                  ⋯
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Concluídas
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>
                {stats.pending}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pendentes
              </Text>
            </View>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Suas Tarefas
            </Text>
            {listaItems.length > 0 && (
              <TouchableOpacity
                onPress={dispararNotificacao}
                style={[styles.notificationButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.notificationButtonText}>🔔</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tasks List */}
          <View style={styles.tasksList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Carregando tarefas...
                </Text>
              </View>
            ) : listaItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>📝</Text>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  Nenhuma tarefa ainda
                </Text>
                <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
                  Crie sua primeira tarefa para começar a organizar seu dia
                </Text>
              </View>
            ) : (
              <FlatList
                data={listaItems}
                renderItem={({ item }) => (
                  <TaskCard
                    title={item.title}
                    isChecked={item.isChecked}
                    id={item.id}
                    onUpdate={atualizarTarefa}
                    onDelete={removerTarefa}
                  />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        </View>

        {/* Add Task Button */}
        <TouchableOpacity
          style={[styles.addTaskButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowNewTaskModal(true)}
        >
          <Text style={styles.addTaskButtonText}>+</Text>
        </TouchableOpacity>

        {/* New Task Modal */}
        <Modal
          visible={showNewTaskModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNewTaskModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Nova Tarefa
              </Text>
              
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder
                  }
                ]}
                placeholder="Digite a descrição da tarefa"
                placeholderTextColor={colors.placeHolderTextColor}
                value={title}
                onChangeText={setTitle}
                multiline
                autoFocus
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.surfaceBackground }]}
                  onPress={() => {
                    setTitle('');
                    setShowNewTaskModal(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={salvarItem}
                  disabled={!title.trim() || isLoading}
                >
                  <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Menu Modal */}
        <Modal
          visible={showMenuModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowMenuModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenuModal(false)}
          >
            <View style={[styles.menuContent, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenuModal(false);
                  router.push("/NewPassword");
                }}
              >
                <Text style={styles.menuItemIcon}>🔑</Text>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Alterar Senha
                </Text>
              </TouchableOpacity>
              
              <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenuModal(false);
                  realizarLogoff();
                }}
              >
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Sair da Conta
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenuModal(false);
                  excluirConta();
                }}
              >
                <Text style={styles.menuItemIcon}>🗑️</Text>
                <Text style={[styles.menuItemText, { color: colors.error }]}>
                  Excluir Conta
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButtonText: {
    fontSize: 16,
  },
  tasksList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  addTaskButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {},
  saveButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuContent: {
    minWidth: 200,
    borderRadius: 12,
    padding: 8,
    marginTop: -100,
    marginRight: 20,
    alignSelf: 'flex-end',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
});