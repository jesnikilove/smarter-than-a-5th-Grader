import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../../../src/theme";

type Step = { q: number; amount: number; safe?: boolean; million?: boolean };

const LADDER: Step[] = [
  { q: 1, amount: 1000 },
  { q: 2, amount: 2000 },
  { q: 3, amount: 5000, safe: true },
  { q: 4, amount: 10000 },
  { q: 5, amount: 25000, safe: true },
  { q: 6, amount: 50000 },
  { q: 7, amount: 100000, safe: true },
  { q: 8, amount: 175000 },
  { q: 9, amount: 300000 },
  { q: 10, amount: 500000, safe: true },          // ✅ Q10 = $500,000
  { q: 11, amount: 1000000, safe: true, million: true }, // ✅ Q11 = $1,000,000
];

function fmtMoney(n: number) {
  return "$" + n.toLocaleString();
}

export default function LadderScreen() {
  const params = useLocalSearchParams();
  const rawStateStr = String(params.state ?? "{}");

  const state = useMemo(() => {
    try {
      return JSON.parse(rawStateStr);
    } catch {
      return {};
    }
  }, [rawStateStr]);

  const questionNumber = Number(state.questionNumber ?? 1);

  const goToQuestion = () => {
    router.replace({
      pathname: "/(tabs)/show/question",
      params: {
        state: JSON.stringify(state),
        round: Date.now().toString(),
      },
    });
  };

  return (
    <LinearGradient colors={[theme.bg, "#000"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Money Ladder</Text>
        <Text style={styles.sub}>
          Next Question: <Text style={styles.gold}>Q{questionNumber}</Text>
        </Text>

        <View style={styles.card}>
          {LADDER.slice()
            .reverse()
            .map((step) => {
              const isCurrent = step.q === questionNumber;
              const isCleared = step.q < questionNumber;

              return (
                <View
                  key={step.q}
                  style={[
                    styles.row,
                    isCurrent && styles.rowCurrent,
                    isCleared && styles.rowCleared,
                  ]}
                >
                  <Text style={[styles.q, isCurrent && styles.qCurrent]}>
                    {step.q}.
                  </Text>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.money, isCurrent && styles.moneyCurrent]}>
                      {fmtMoney(step.amount)}
                    </Text>

                    <View style={styles.badges}>
                      {step.safe && (
                        <View style={[styles.badge, styles.badgeSafe]}>
                          <Text style={styles.badgeTextDark}>SAFE</Text>
                        </View>
                      )}

                      {step.million && (
                        <View style={[styles.badge, styles.badgeMillion]}>
                          <Text style={styles.badgeTextDark}>1 MILLION DOLLAR QUESTION</Text>
                        </View>
                      )}

                      {isCleared && (
                        <View style={[styles.badge, styles.badgeCleared]}>
                          <Text style={styles.badgeTextDark}>CLEARED</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {isCurrent ? <View style={styles.dot} /> : <View style={{ width: 12 }} />}
                </View>
              );
            })}
        </View>

        <Pressable style={styles.primary} onPress={goToQuestion}>
          <Text style={styles.primaryText}>Go to Question</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },

  title: { color: theme.text, fontSize: 26, fontWeight: "900", textAlign: "center", marginTop: 8 },
  sub: { color: theme.textDim, fontWeight: "800", textAlign: "center" },
  gold: { color: theme.gold, fontWeight: "900" },

  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 9,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  rowCurrent: { borderColor: theme.gold, backgroundColor: "rgba(255,204,51,0.14)" },
  rowCleared: { opacity: 0.75 },

  q: { width: 34, textAlign: "right", color: theme.textDim, fontWeight: "900" },
  qCurrent: { color: theme.gold },

  money: { color: theme.text, fontWeight: "900", fontSize: 16 },
  moneyCurrent: { color: theme.gold, fontSize: 18 },

  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },

  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  badgeTextDark: { color: "#111", fontWeight: "900", fontSize: 12 },

  badgeSafe: { backgroundColor: theme.gold, borderColor: theme.gold },
  badgeMillion: { backgroundColor: theme.accent, borderColor: theme.accent },
  badgeCleared: { backgroundColor: "rgba(255,255,255,0.80)", borderColor: "rgba(255,255,255,0.80)" },

  dot: { width: 12, height: 12, borderRadius: 999, backgroundColor: theme.gold },

  primary: { backgroundColor: theme.gold, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  primaryText: { color: "#111", fontWeight: "900", fontSize: 16 },
});

