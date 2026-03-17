import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Q = { id: string; prompt: string; choices: string[]; answer: number };

const SUBJECTS_DEFAULT = ["Math", "Grammar", "Social Studies", "Animal Science", "Spelling"];

const LADDER = [
  { q: 1, amount: 1000, safe: false },
  { q: 2, amount: 2000, safe: false },
  { q: 3, amount: 5000, safe: true },
  { q: 4, amount: 10000, safe: false },
  { q: 5, amount: 25000, safe: true },
  { q: 6, amount: 50000, safe: false },
  { q: 7, amount: 100000, safe: true },
  { q: 8, amount: 175000, safe: false },
  { q: 9, amount: 300000, safe: false },
  { q: 10, amount: 500000, safe: true },
];

function gradeForQuestion(qn: number) {
  if (qn <= 2) return 1;
  if (qn <= 4) return 2;
  if (qn <= 6) return 3;
  if (qn <= 8) return 4;
  return 5;
}

function lastSafeAmount(clearedQ: number) {
  let safe = 0;
  for (const s of LADDER) if (s.q <= clearedQ && s.safe) safe = s.amount;
  return safe;
}

// Put at least 2 per subject per grade so you can see variety.
const BANK: Record<number, Record<string, Q[]>> = {
  1: {
    "Animal Science": [
      { id: "1-a-1", prompt: "Which is an animal?", choices: ["Tree","Dog","Cloud","Rock"], answer: 1 },
      { id: "1-a-2", prompt: "Which animal barks?", choices: ["Cat","Dog","Cow","Fish"], answer: 1 },
    ],
    Math: [
      { id: "1-m-1", prompt: "What is 9 + 6?", choices: ["12","13","15","16"], answer: 2 },
      { id: "1-m-2", prompt: "What is 10 + 4?", choices: ["12","13","14","15"], answer: 2 },
    ],
    Grammar: [
      { id: "1-g-1", prompt: "Which word is a noun?", choices: ["run","blue","dog","fast"], answer: 2 },
      { id: "1-g-2", prompt: "Which is a verb?", choices: ["Jump","Green","Soft","Tall"], answer: 0 },
    ],
    "Social Studies": [
      { id: "1-ss-1", prompt: "A community is a group of ____.", choices: ["animals","people","rocks","cars"], answer: 1 },
      { id: "1-ss-2", prompt: "A rule is something you ____.", choices: ["follow","eat","wear","throw"], answer: 0 },
    ],
    Spelling: [
      { id: "1-s-1", prompt: "Which is spelled correctly?", choices: ["becaus","because","becose","becuase"], answer: 1 },
      { id: "1-s-2", prompt: "Which is spelled correctly?", choices: ["frend","friend","freind","frand"], answer: 1 },
    ],
  },
  2: {
    "Animal Science": [
      { id: "2-a-1", prompt: "Which animal lays eggs?", choices: ["Dog","Chicken","Cow","Horse"], answer: 1 },
      { id: "2-a-2", prompt: "Which is a reptile?", choices: ["Frog","Snake","Robin","Shark"], answer: 1 },
    ],
    Math: [
      { id: "2-m-1", prompt: "What is 14 − 7?", choices: ["5","6","7","8"], answer: 2 },
      { id: "2-m-2", prompt: "What is 18 − 9?", choices: ["7","8","9","10"], answer: 2 },
    ],
    Grammar: [
      { id: "2-g-1", prompt: "Choose the best sentence.", choices: ["i went home.","I went home.","I went Home.","i Went home."], answer: 1 },
      { id: "2-g-2", prompt: "Which is a pronoun?", choices: ["run","she","blue","fast"], answer: 1 },
    ],
    "Social Studies": [
      { id: "2-ss-1", prompt: "A map shows ____.", choices: ["weather","places","music","food"], answer: 1 },
      { id: "2-ss-2", prompt: "A globe shows ____.", choices: ["the Earth","a dog","a car","a song"], answer: 0 },
    ],
    Spelling: [
      { id: "2-s-1", prompt: "Which is spelled correctly?", choices: ["tomorow","tomorrow","tommorow","tommorrow"], answer: 1 },
      { id: "2-s-2", prompt: "Which is spelled correctly?", choices: ["pumkin","pumpkin","pumpken","pompkin"], answer: 1 },
    ],
  },
};

function pickNextQuestion(grade: number, subject: string, usedIds: string[]): Q | null {
  const poolAll = BANK?.[grade]?.[subject] ?? [];
  if (!poolAll.length) return null;

  const available = poolAll.filter(q => !usedIds.includes(q.id));
  // deterministic rotation: take the first unused; if all used, restart
  return (available[0] ?? poolAll[0]) ?? null;
}

export default function QuestionScreen() {
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
  const winnings = Number(state.winnings ?? 0);
  const saveArmed = Boolean(state.saveArmed ?? false);
  const subjects: string[] = state.subjects ?? SUBJECTS_DEFAULT;

  const usedIds: string[] = state.usedQuestionIds ?? [];

  const grade = gradeForQuestion(questionNumber);

  const [subjectPicked, setSubjectPicked] = useState<string | null>(null);
  const [q, setQ] = useState<Q | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ CRITICAL: reset local UI state whenever params.state changes (prevents “can’t tap”)
  useEffect(() => {
    setSubjectPicked(null);
    setQ(null);
    setSelected(null);
    setLocked(false);
    setMessage(null);
  }, [rawStateStr]);

  const pickSubject = (subj: string) => {
    const picked = pickNextQuestion(grade, subj, usedIds);

    setSubjectPicked(subj);
    setQ(picked);
    setSelected(null);
    setLocked(false);
    setMessage(null);

    // ✅ mark it used immediately so it won't repeat when you come back
    if (picked && !usedIds.includes(picked.id)) {
      const nextState = { ...state, usedQuestionIds: [...usedIds, picked.id] };
      router.replace({
        pathname: "/(tabs)/show/question",
        params: { state: JSON.stringify(nextState) },
      });
    }
  };

  const choose = (i: number) => {
    if (!q) return;
    if (locked) return;

    setSelected(i);
    setLocked(true);

    const correct = i === q.answer;
    setMessage(correct ? "Correct!" : (saveArmed ? "Wrong — but SAVE gives you a second chance!" : "Wrong."));
  };

  const onContinue = () => {
    if (!q || selected === null) return;

    const correct = selected === q.answer;
    const step = LADDER.find((s) => s.q === questionNumber);

    if (correct) {
      const nextState = {
        ...state,
        winnings: step ? step.amount : winnings,
        questionNumber: questionNumber + 1,
        saveArmed: false,
      };

      if (questionNumber >= 10) {
        router.replace({
          pathname: "/(tabs)/show/final",
          params: { state: JSON.stringify({ ...nextState, smarter: true }) },
        });
        return;
      }

      router.replace({
        pathname: "/(tabs)/show/ladder",
        params: { state: JSON.stringify(nextState) },
      });
      return;
    }

    // wrong
    if (saveArmed) {
      router.replace({
        pathname: "/(tabs)/show/question",
        params: { state: JSON.stringify({ ...state, saveArmed: false }) },
      });
      return;
    }

    const safe = lastSafeAmount(questionNumber - 1);
    router.replace({
      pathname: "/(tabs)/show/final",
      params: { state: JSON.stringify({ ...state, smarter: false, winnings: safe }) },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pick a Subject</Text>
      <Text style={styles.sub}>Q{questionNumber}/10 • Grade {grade}</Text>
      <Text style={styles.money}>Current Winnings: ${winnings.toLocaleString()}</Text>

      {!subjectPicked && (
        <View style={styles.wrap}>
          {subjects.map((s) => (
            <Pressable key={s} style={styles.pill} onPress={() => pickSubject(s)}>
              <Text style={styles.pillText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {subjectPicked && !q && (
        <Text style={{ fontWeight: "900" }}>
          No questions available for {subjectPicked} (Grade {grade}).
        </Text>
      )}

      {subjectPicked && q && (
        <>
          <Text style={styles.meta}>Subject: {subjectPicked}</Text>
          <Text style={styles.question}>{q.prompt}</Text>

          <View style={{ gap: 10 }}>
            {q.choices.map((c, i) => {
              const showCorrect = locked && i === q.answer;
              const showWrong = locked && selected === i && i !== q.answer;
              return (
                <Pressable
                  key={i}
                  onPress={() => choose(i)}
                  // IMPORTANT: disable only AFTER you answered
                  disabled={locked}
                  style={[styles.answer, showCorrect && styles.correct, showWrong && styles.wrong]}
                >
                  <Text style={styles.answerText}>
                    {String.fromCharCode(65 + i)}. {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {message && <Text style={styles.msg}>{message}</Text>}

          {locked && (
            <Pressable style={styles.primary} onPress={onContinue}>
              <Text style={styles.primaryText}>Continue</Text>
            </Pressable>
          )}

          {!locked && (
            <Pressable
              style={styles.secondary}
              onPress={() => {
                setSubjectPicked(null);
                setQ(null);
                setSelected(null);
                setLocked(false);
                setMessage(null);
              }}
            >
              <Text style={styles.secondaryText}>Change Subject</Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "900", marginTop: 6 },
  sub: { color: "#555", fontWeight: "700" },
  money: { fontWeight: "900", marginTop: 2 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  pill: { borderWidth: 1, borderColor: "#111", borderRadius: 999, paddingVertical: 10, paddingHorizontal: 12 },
  pillText: { fontWeight: "900" },
  meta: { fontWeight: "900", color: "#333", marginTop: 10 },
  question: { fontSize: 20, fontWeight: "900" },
  answer: { borderWidth: 1, borderColor: "#ddd", borderRadius: 16, padding: 14 },
  answerText: { fontWeight: "800" },
  correct: { borderColor: "#1a7f37" },
  wrong: { borderColor: "#c62828" },
  msg: { fontWeight: "900", marginTop: 6 },
  primary: { marginTop: 14, backgroundColor: "#111", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900" },
  secondary: { marginTop: 10, borderWidth: 1, borderColor: "#111", paddingVertical: 12, borderRadius: 16, alignItems: "center" },
  secondaryText: { fontWeight: "900" },
});
