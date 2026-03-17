import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function FinalScreen() {
  const params = useLocalSearchParams();

  const state = useMemo(() => {
    try {
      return JSON.parse(String(params.state || "{}"));
    } catch {
      return {};
    }
  }, [params.state]);

  const smarter = Boolean((state as any).smarter ?? false);
  const winnings = Number((state as any).winnings ?? 0);

  const playAgain = () => {
    // reset game state
    const fresh = {
      questionNumber: 1,
      winnings: 0,
      saveArmed: false,
      usedQuestionIds: [],
    };

    router.replace({
      pathname: "/(tabs)/show/ladder",
      params: { state: JSON.stringify(fresh) },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {smarter ? "YOU ARE SMARTER THAN A 5TH GRADER!" : "GAME OVER"}
      </Text>

      <Text style={styles.money}>You won: ${winnings.toLocaleString()}</Text>

      <Pressable style={styles.primary} onPress={playAgain}>
        <Text style={styles.primaryText}>Play Again</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => router.replace("/(tabs)")} >
        <Text style={styles.secondaryText}>Back Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 14, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "900", textAlign: "center" },
  money: { fontSize: 18, fontWeight: "900", textAlign: "center" },
  primary: { backgroundColor: "#111", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  secondary: { borderWidth: 1, borderColor: "#111", paddingVertical: 12, borderRadius: 16, alignItems: "center" },
  secondaryText: { fontWeight: "900" },
});
