import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function QuestionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Question screen placeholder</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: "center", justifyContent: "center" }, text: { fontWeight: "900" }});
