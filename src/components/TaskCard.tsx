import { doc, updateDoc, deleteDoc, database } from "../configurations/firebaseConfig";
import { StyleSheet, View, Text, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";

export default function TaskCard(props: any) {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  useEffect(() => {
    const updateIsChecked = async () => {
      const itemRef = doc(database, "tasks", props.id);
      await updateDoc(itemRef, { isChecked });
    };
    updateIsChecked();
  }, [isChecked]);

  const handleToggleCheck = () => {
    setIsChecked((prev: boolean) => !prev);
  };

  const handleDelete = () => {
    Alert.alert("Exclusão", "Deseja realmente excluir a tarefa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(database, "tasks", props.id));
          Alert.alert("Exclusão efetuada", "Tarefa excluída com sucesso.");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleToggleCheck} style={styles.icon}>
        <Text style={{ fontSize: 22 }}>
          {isChecked ? "✔️" : "⭕"}
        </Text>
      </Pressable>

      <Text style={styles.title}>
        {props.title}
      </Text>

      <Pressable onPress={handleDelete} style={styles.icon}>
        <Text style={{ fontSize: 20 }}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "lightgray",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 5
  },
  title: {
    flex: 1,
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "500"
  },
  icon: {
    paddingHorizontal: 5
  }
});