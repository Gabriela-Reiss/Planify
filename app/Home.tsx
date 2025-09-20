import {
  Text,
  Alert,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  StatusBar,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import TaskCard from "../src/components/TaskCard";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { deleteUser } from "firebase/auth";
import { auth, collection, addDoc, database, getDocs } from "../src/configurations/firebaseConfig";
import ContextThemeButton from "../src/components/ContextThemeButton";
import { useTheme } from "../src/context/ContextTheme";
import * as Notifications from 'expo-notifications';
import { useQuery } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// API DE FRASES MOTIVACIONAIS 
const fetchMotivationalQuote = async (): Promise<{ q: string; a: string }> => {
  const response = await fetch("https://zenquotes.io/api/random");
  const data = await response.json();
  return data[0]; 
};

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [userName, setUserName] = useState('Usuário');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { t, i18n } = useTranslation();


  interface Tarefa {
    id: string;
    title: string;
    isChecked: boolean;
    dueDate?: string | null;
    createdAt: string;
    updatedAt: string;
  }

  const [listaItems, setListaItems] = useState<Tarefa[]>([]);

  const { data: quoteData, refetch: refetchQuote, isFetching } = useQuery({
    queryKey: ['motivational-quote'],
    queryFn: fetchMotivationalQuote,
    enabled: false
  });

  const handleShowQuote = async () => {
    await refetchQuote();
    setShowQuoteModal(true);
  };

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };


  
  useEffect(() => {
    const setupNotifications = async () => {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
      });

      const { status } = await Notifications.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    setupNotifications();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notificação recebida: ", notification);
    });

    return () => subscription.remove();
  }, []);

 
  useEffect(() => {
    const agendarNotificacaoTarefasPendentes = async () => {
      if (!hasPermission) return;

      const tarefasPendentes = listaItems.filter(item => !item.isChecked);
      if (tarefasPendentes.length === 0) return;

      
      await Notifications.scheduleNotificationAsync({
  content: {
    title: t("pendingTasksTitle"),
    body: t("pendingTasksBody", { count: tarefasPendentes.length }),
  },
  trigger: { repeats: false } as Notifications.TimeIntervalTriggerInput,
});
    };

    agendarNotificacaoTarefasPendentes();
  }, [listaItems, hasPermission]);

  

  const realizarLogoff = async () => {
    Alert.alert(
      t("Log out of account"),
      t("Are you sure you want to log out?"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Go out"),
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
      t("Confirm Deletion"),
      t("Are you sure you want to delete your account? This action cannot be undone!"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Delete"),
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
                await AsyncStorage.removeItem('@user');
                Alert.alert(t("accountDeletedTitle"),t("accountDeletedBody"));
                router.replace('/');
              } else {
                Alert.alert("Erro", "Nenhum usuário logado.");
              }
            } catch (error: any) {
              console.log("Erro ao excluir conta:", error);
              Alert.alert("Erro", "Não foi possível excluir conta");
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
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(database, 'tasks'), {
        title: title.trim(),
        isChecked: false,
        dueDate: dueDate ? dueDate.toISOString() : null,
        createdAt: now,
        updatedAt: now,
      });

      const novaTarefa: Tarefa = {
        id: docRef.id,
        title: title.trim(),
        isChecked: false,
        dueDate: dueDate ? dueDate.toISOString() : null,
        createdAt: now,
        updatedAt: now,
      };

      setListaItems(prev => [...prev, novaTarefa]);
      setTitle('');
      setDueDate(null);
      setShowNewTaskModal(false);


    } catch (error: any) {
      console.log("Erro ao adicionar documento:", error.code, error.message);
      Alert.alert("Erro ao salvar tarefa", error.message || "Erro desconhecido");
    }
  };

  const buscarItems = async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(database, 'tasks'));
      const items: Tarefa[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.title && typeof data.isChecked === 'boolean') {
          items.push({
            id: docSnap.id,
            title: data.title,
            isChecked: data.isChecked,
            dueDate: data.dueDate || null,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        } else {
          console.log("Documento inválido ignorado:", docSnap.id, data);
        }
      });
      setListaItems(items);
    } catch (error: any) {
      console.log("Erro ao buscar tarefas:", error.code, error.message);
      Alert.alert("Erro", "Não foi possível carregar as tarefas");
    } finally {
      setIsLoading(false);
    }
  };


  const atualizarTarefa = (id: string, dadosAtualizados: Partial<Tarefa>) => {
    setListaItems(prev =>
      prev.map(item => item.id === id ? { ...item, ...dadosAtualizados } : item)
    );
  };

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
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("Good morning");
    if (hour < 18) return t("Good afternoon");
    return t("Good night");
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
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>

              <TouchableOpacity
                style={[styles.quoteButton, { backgroundColor: colors.primary }]}
                onPress={handleShowQuote}
              >
                <Text style={styles.quoteButtonText}>💡 {t("See quote of the day")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerActions}>
              <ContextThemeButton />
              <TouchableOpacity
                style={[styles.menuButton, { backgroundColor: colors.surfaceBackground }]}
                onPress={() => setShowMenuModal(true)}
              >
                <Text style={[styles.menuButtonText, { color: colors.text }]}>⋯</Text>
              </TouchableOpacity>
            </View>
          </View>


          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{stats.completed}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("Completed")}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t("Pending")}</Text>
            </View>
          </View>
        </View>


        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("Your tasks")}</Text>
          </View>
          <View style={styles.tasksList}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : listaItems.length === 0 ? (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 32 }}>{t("No tasks yet")}</Text>
            ) : (
              <FlatList
                data={listaItems}
                renderItem={({ item }) => (
                  <TaskCard
                    id={item.id}
                    title={item.title}
                    isChecked={item.isChecked}
                    dueDate={item.dueDate}
                    onUpdate={atualizarTarefa}
                    onDelete={removerTarefa}
                  />
                )}
                keyExtractor={(item) => item.id}
              />
            )}
          </View>
        </View>

        {/* Botão + Nova Tarefa */}
        <TouchableOpacity
          style={[styles.addTaskButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowNewTaskModal(true)}
        >
          <Text style={styles.addTaskButtonText}>+</Text>
        </TouchableOpacity>

        {/* Modal Nova Tarefa */}
        <Modal visible={showNewTaskModal} animationType="slide" transparent={true} onRequestClose={() => setShowNewTaskModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("New task")}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }]}
                placeholder={t("Enter the task description")}
                placeholderTextColor={colors.placeHolderTextColor}
                value={title}
                onChangeText={setTitle}
                multiline
                autoFocus
              />

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.modalButton, { backgroundColor: colors.surfaceBackground, marginTop: 8 }]}
              >
                <Text style={{ color: colors.text }}>{t("Select Due Date:")} {dueDate ? dueDate.toLocaleDateString("pt-BR") : t("None")}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display="calendar"
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setDueDate(date);
                  }}
                />
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.surfaceBackground }]}
                  onPress={() => { setTitle(''); setDueDate(null); setShowNewTaskModal(false); }}
                >
                  <Text style={{ color: colors.textSecondary }}>{t("Cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={salvarItem}
                  disabled={!title.trim() || isLoading}
                >
                  <Text style={{ color: colors.buttonText }}>{isLoading ? t("Saving...") : t("Save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


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
                onPress={() => { setShowMenuModal(false); router.push("/NewPassword"); }}
              >
                <Text style={styles.menuItemIcon}>🔑</Text>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t("Change password")}</Text>
              </TouchableOpacity>
              <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenuModal(false); realizarLogoff(); }}
              >
                <Text style={styles.menuItemIcon}>🚪</Text>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t("Log out of account")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenuModal(false); excluirConta(); }}
              >
                <Text style={styles.menuItemIcon}>🗑️</Text>
                <Text style={[styles.menuItemText, { color: colors.error }]}>{t("Delete account")}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>


        <Modal
          visible={showQuoteModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowQuoteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("Quote of the day")}</Text>
              {isFetching ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : quoteData ? (
                <>
                  <Text style={[styles.quoteText, { color: colors.text }]}>"{quoteData.q}"</Text>
                  <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>— {quoteData.a}</Text>
                </>
              ) : (
                <Text style={{ color: colors.text }}>{t("Unable to load sentence.")}</Text>
              )}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={() => setShowQuoteModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>{t("Close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flex: 1 },
  greeting: { fontSize: 16 },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  quoteButton: { padding: 8, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  quoteButtonText: { color: '#fff', fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  menuButton: { padding: 8, borderRadius: 8, marginLeft: 8 },
  menuButtonText: { fontSize: 24 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 14 },
  tasksSection: { flex: 1, paddingHorizontal: 16 },
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
  tasksSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  notificationButton: { padding: 8, borderRadius: 8 },
  notificationButtonText: { fontSize: 18, color: '#fff' },
  tasksList: { flex: 1 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  loadingText: { marginTop: 8 },
  emptyState: { justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  emptyStateEmoji: { fontSize: 48 },
  emptyStateTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  emptyStateDescription: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  addTaskButton: { position: 'absolute', bottom: 32, right: 32, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  addTaskButtonText: { fontSize: 36, color: '#fff' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 8, minHeight: 40, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  cancelButton: {},
  saveButton: {},
  modalButtonText: { fontWeight: 'bold' },
  menuContent: { position: 'absolute', top: 64, right: 16, borderRadius: 12, paddingVertical: 8, width: 200 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  menuItemIcon: { marginRight: 8, fontSize: 18 },
  menuItemText: { fontSize: 16 },
  menuDivider: { height: 1, marginVertical: 4 },
  quoteText: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
  quoteAuthor: { fontSize: 16, textAlign: 'center', marginTop: 4 },
  flatListContent: { paddingBottom: 128 }
});
