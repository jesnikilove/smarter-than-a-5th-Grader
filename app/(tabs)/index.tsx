import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../src/theme";

type CategoryCard = { grade: number; subject: string };

// This is the show-style “deck” of cards (11 total)
const DEFAULT_DECK: CategoryCard[] = [
  { grade: 1, subject: "Grammar" },
  { grade: 1, subject: "Spelling" },

  { grade: 2, subject: "Animal Science" },
  { grade: 2, subject: "Health" },

  { grade: 3, subject: "Physical Education" },
  { grade: 3, subject: "Science" },

  { grade: 4, subject: "Math" },
  { grade: 4, subject: "Social Studies" },

  { grade: 5, subject: "Science" },
  { grade: 5, subject: "World Geography" },

  // 11th card
  { grade: 5, subject: "Math" },
];

export default function HomeScreen() {
  const startGame = () => {
    const seed = Math.floor(Math.random() * 2_000_000_000);

    const state = {
      seed,
      rngCounter: 0,

      questionNumber: 1,
      winnings: 0,

      // Lifelines
      lifelinesUsed: { peek: false, copy: false, save: false },
      saveArmed: false,

      // Pack tracking
      usedQuestionIds: [],

      // NEW: show-style deck of grade+subject cards
      availableCategories: DEFAULT_DECK,

      // optional flags
      smarter: null,
    };

    router.replace({
      pathname: "/(tabs)/show/ladder",
      params: { state: JSON.stringify(state) },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Are You Smarter Than a 5th Grader?</Text>
        <Text style={styles.sub}>11 Questions • Top Prize: $1,000,000</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Game Rules (Show Style)</Text>
          <Text style={styles.rule}>• You pick a grade+category card each round.</Text>
          <Text style={styles.rule}>• Once used, that card is removed.</Text>
          <Text style={styles.rule}>• Math & Spelling are typed answers.</Text>
          <Text style={styles.rule}>• Other subjects are multiple choice.</Text>
        </View>

        <Pressable onPress={startGame} style={styles.primary}>
          <Text style={styles.primaryText}>Start Game</Text>
        </Pressable>

        <Text style={styles.footer}>
          Tip: If changes don’t show, restart with: <Text style={{ fontWeight: "900" }}>npx expo start -c</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: { flex: 1, padding: 18, justifyContent: "center", gap: 14 },

  title: { fontSize: 24, fontWeight: "900", color: theme.text, textAlign: "center" },
  sub: { color: theme.textDim, fontWeight: "800", textAlign: "center" },

  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  cardTitle: { color: theme.gold, fontWeight: "900", fontSize: 16, marginBottom: 4, textAlign: "center" },
  rule: { color: theme.text, fontWeight: "800" },

  primary: {
    marginTop: 6,
    backgroundColor: theme.gold,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: { color: "#111", fontWeight: "900", fontSize: 16 },

  footer: { marginTop: 10, color: theme.textDim, fontWeight: "800", textAlign: "center" },
});
