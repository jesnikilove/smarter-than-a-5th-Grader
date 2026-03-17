import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function FinalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Final screen placeholder</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, alignItems: "center", justifyContent: "center" }, text: { fontWeight: "900" }});
