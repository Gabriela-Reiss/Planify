import { doc, updateDoc, deleteDoc, database } from "../configurations/firebaseConfig";
import { StyleSheet, View, Text, Pressable, Alert, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ContextTheme";
import { useTranslation } from "react-i18next";

interface TaskCardProps {
  id: string;
  title: string;
  isChecked: boolean;
  dueDate?: string | null;
  onUpdate?: (id: string, data: { isChecked: boolean }) => void;
  onDelete?: (id: string) => void;
}

export default function TaskCard({ id, title, isChecked: initialChecked, dueDate, onUpdate, onDelete }: TaskCardProps) {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsChecked(initialChecked);
  }, [initialChecked]);

  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const animateCheck = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleToggleCheck = async () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    animateCheck();

    if (onUpdate) onUpdate(id, { isChecked: newCheckedState });

    try {
      const itemRef = doc(database, "tasks", id);
      await updateDoc(itemRef, { isChecked: newCheckedState });
    } catch (error) {
      console.log("Erro ao atualizar tarefa:", error);
      setIsChecked(!newCheckedState);
      if (onUpdate) onUpdate(id, { isChecked: !newCheckedState });
      Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
    }
  };

  const animateDelete = () => {
    Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir Tarefa",
      `Tem certeza que deseja excluir "${title.length > 30 ? title.substring(0, 30) + '...' : title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            animateDelete();
            if (onDelete) setTimeout(() => onDelete(id), 300);
            try {
              await deleteDoc(doc(database, "tasks", id));
            } catch (error) {
              console.log("Erro ao excluir tarefa:", error);
              Alert.alert("Erro", "Não foi possível excluir a tarefa.");
              opacityAnim.setValue(1);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const isOverdue = dueDate ? new Date(dueDate) < new Date() && !isChecked : false;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: colors.shadow, opacity: opacityAnim },
      ]}
    >
      <Pressable
        onPress={handleToggleCheck}
        style={[styles.checkboxContainer, { backgroundColor: isChecked ? colors.success : colors.input, borderColor: isChecked ? colors.success : colors.inputBorder }]}
        disabled={isLoading}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {isChecked ? <Text style={styles.checkIcon}>✓</Text> : <View style={styles.emptyCheck} />}
        </Animated.View>
      </Pressable>

      <View style={styles.taskContent}>
        <Text
          style={[styles.title, { color: isChecked ? colors.textMuted : colors.text, textDecorationLine: isChecked ? 'line-through' : 'none' }]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {dueDate && (
          <Text style={[styles.dueDate, { color: isOverdue ? colors.error : colors.textSecondary }]}>
            Prazo: {dueDate ? new Date(dueDate).toLocaleDateString("pt-BR") : "Nenhum"}
          </Text>
        )}

        {isChecked && <Text style={[styles.completedLabel, { color: colors.success }]}>{t("completed")}</Text>}
      </View>

      <View
        style={[styles.priorityIndicator, { backgroundColor: isChecked ? colors.success : title.includes('!') ? colors.error : colors.primary }]}
      />

      <Pressable
        onPress={handleDelete}
        style={[styles.deleteButton, { backgroundColor: colors.surfaceBackground }]}
        disabled={isLoading}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", padding: 16, marginVertical: 4, marginHorizontal: 2, borderRadius: 12, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  checkboxContainer: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center", marginRight: 12 },
  checkIcon: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  emptyCheck: { width: 12, height: 12 },
  taskContent: { flex: 1, paddingRight: 12 },
  title: { fontSize: 16, fontWeight: "500", lineHeight: 22, marginBottom: 2 },
  dueDate: { fontSize: 12, marginTop: 2 },
  completedLabel: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  priorityIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  deleteButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  deleteIcon: { fontSize: 16 },
});
