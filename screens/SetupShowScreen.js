import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SetupShowScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Show Setup Screen ✅</Text>
      <Text style={styles.sub}>If you can see this, your App.js is wired correctly.</Text>

      <Pressable style={styles.btn} onPress={() => navigation.navigate("Ladder")}>
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff", justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "900" },
  sub: { color: "#555", fontWeight: "600" },
  btn: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
