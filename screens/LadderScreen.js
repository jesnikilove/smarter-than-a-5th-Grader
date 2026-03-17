import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LadderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ladder screen placeholder</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: "center", justifyContent: "center" }, text: { fontWeight: "900" }});
