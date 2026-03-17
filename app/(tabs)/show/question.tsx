import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { flattenPacks } from "../../../data/packs";
import { theme } from "../../../src/theme";

type MCQ = {
  id: string;
  grade: number;
  subject: string;
  prompt: string;
  choices: string[];
  answer: number;
};

type CategoryCard = { grade: number; subject: string };

type ShortQ = {
  type: "short";
  id: string;
  grade: number;
  subject: "Math" | "Spelling";
  prompt: string;
  correct: string;
  displayAnswer: string;
};

type AnyQ = ({ type: "mc" } & MCQ) | ShortQ;

const ALL_QUESTIONS: MCQ[] = flattenPacks();

// ✅ Safe levels you specified (matched to question numbers on a typical ladder)
const SAFE_LEVELS: Record<number, number> = {
  3: 5000,
  5: 25000,
  8: 100000,
  10: 500000,
};

function normalize(s: string) {
  return (s ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "");
}
function normMath(s: string) {
  return (s ?? "").trim().replace(/,/g, "").replace(/\s+/g, "");
}
function normSpell(s: string) {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, "");
}
function subjectMatches(a: string, b: string) {
  return normalize(a) === normalize(b);
}

/** Sound (single instance; no overlap) */
function useSfx() {
  const current = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        });
      } catch {}
    })();

    return () => {
      (async () => {
        try {
          if (current.current) {
            await current.current.stopAsync();
            await current.current.unloadAsync();
            current.current = null;
          }
        } catch {}
      })();
    };
  }, []);

  const play = async (file: any) => {
    try {
      if (current.current) {
        await current.current.stopAsync();
        await current.current.unloadAsync();
        current.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(file, {
        shouldPlay: true,
        volume: 1.0,
      });
      current.current = sound;
    } catch {}
  };

  return { play };
}

/** Math short-answer builder */
function buildMath(grade: number): ShortQ {
  const a = Math.floor(Math.random() * 20 + grade * 5);
  const b = Math.floor(Math.random() * 20 + grade * 5);
  const ans = a + b;

  return {
    type: "short",
    id: `short-math-${grade}-${Date.now()}`,
    grade,
    subject: "Math",
    prompt: `${grade} Grade Math: What is ${a} + ${b}?`,
    correct: normMath(String(ans)),
    displayAnswer: String(ans),
  };
}

/** Spelling short-answer builder */
function buildSpelling(grade: number): ShortQ {
  const pools: Record<number, string[]> = {
    1: ["cat", "dog", "tree", "book", "milk", "jump", "rain"],
    2: ["friend", "school", "because", "pencil", "answer", "pumpkin"],
    3: ["different", "important", "surprise", "remember", "favorite"],
    4: ["environment", "community", "temperature", "excellent", "separate"],
    5: ["responsibility", "independent", "communication", "occasionally", "accommodate"],
  };
  const list = pools[grade] ?? pools[3];
  const word = list[Math.floor(Math.random() * list.length)];

  return {
    type: "short",
    id: `short-spell-${grade}-${Date.now()}`,
    grade,
    subject: "Spelling",
    prompt: `${grade} Grade Spelling: Tap Play Word, then type it.`,
    correct: normSpell(word),
    displayAnswer: word,
  };
}

/** MCQ picker: never returns A/B/C/D placeholders; always real text */
function pickMCQ(grade: number, subject: string): MCQ {
  // 1) exact grade+subject
  const exact = ALL_QUESTIONS.filter(
    (q) => q.grade === grade && subjectMatches(q.subject, subject)
  );
  if (exact.length) return exact[Math.floor(Math.random() * exact.length)];

  // 2) any question from same grade (keeps difficulty appropriate)
  const sameGrade = ALL_QUESTIONS.filter((q) => q.grade === grade);
  if (sameGrade.length) return sameGrade[Math.floor(Math.random() * sameGrade.length)];

  // 3) absolute last resort (still looks like a real question)
  return {
    id: `fallback-${Date.now()}`,
    grade,
    subject,
    prompt: `${grade} Grade ${subject}: Which is a complete sentence?`,
    choices: ["I ran home.", "Because.", "The dog.", "In the park"],
    answer: 0,
  };
}

export default function QuestionScreen() {
  const params = useLocalSearchParams();
  const state = useMemo(() => {
    try {
      return JSON.parse(String(params.state ?? "{}"));
    } catch {
      return {};
    }
  }, [params.state]);

  const questionNumber = Number(state.questionNumber ?? 1);
  const winnings = Number(state.winnings ?? 0);
  const availableCategories: CategoryCard[] = state.availableCategories ?? [];

  const [selectedCard, setSelectedCard] = useState<CategoryCard | null>(null);
  const [question, setQuestion] = useState<AnyQ | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const { play } = useSfx();

  useEffect(() => {
    setSelectedCard(null);
    setQuestion(null);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setRevealed(false);
    setIsCorrect(null);
  }, [questionNumber]);

  const goHome = () => {
    Speech.stop();
    router.replace("/(tabs)/");
  };

  const chooseCategory = (card: CategoryCard) => {
    setSelectedCard(card);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setRevealed(false);
    setIsCorrect(null);

    if (normalize(card.subject) === "math") {
      setQuestion(buildMath(card.grade));
      return;
    }

    if (normalize(card.subject) === "spelling") {
      setQuestion(buildSpelling(card.grade));
      return;
    }

    const mc = pickMCQ(card.grade, card.subject);
    setQuestion({ ...mc, type: "mc" });
  };

  const playSpellingWord = () => {
    if (!question || question.type !== "short") return;
    if (question.subject !== "Spelling") return;
    Speech.stop();
    Speech.speak(question.displayAnswer, { rate: 0.9, pitch: 1.0 });
  };

  const submitAnswer = async () => {
    if (!question) return;

    let ok = false;

    if (question.type === "mc") {
      if (selectedAnswer === null) return;
      ok = selectedAnswer === question.answer;
    } else {
      if (!typedAnswer.trim()) return;
      ok =
        question.subject === "Math"
          ? normMath(typedAnswer) === question.correct
          : normSpell(typedAnswer) === question.correct;
    }

    setRevealed(true);
    setIsCorrect(ok);

    if (ok) await play(require("../../../assets/sfx/correct.mp3"));
    else await play(require("../../../assets/sfx/wrong.mp3"));
  };

  const continueGame = async () => {
    if (!question) return;

    if (!isCorrect) {
      const safeMoney = SAFE_LEVELS[questionNumber - 1] ?? 0;
      await play(require("../../../assets/sfx/final.mp3"));

      router.replace({
        pathname: "/(tabs)/show/final",
        params: { state: JSON.stringify({ ...state, winnings: safeMoney }) },
      });
      return;
    }

    // keep your existing winnings logic (ladder screen can also compute/override)
    const nextState = {
      ...state,
      questionNumber: questionNumber + 1,
      winnings,
    };

    router.replace({
      pathname: "/(tabs)/show/ladder",
      params: { state: JSON.stringify(nextState) },
    });
  };

  const actionLabel = revealed ? "Continue" : "Final Answer";
  const actionDisabled =
    !question ||
    (question.type === "mc" ? selectedAnswer === null : !typedAnswer.trim());

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>Question {questionNumber}/11</Text>
        <Pressable onPress={goHome} hitSlop={18} style={({ pressed }) => [styles.homeBtn, pressed && styles.pressed]}>
          <Text style={styles.homeText}>Home</Text>
        </Pressable>
      </View>

      <Text style={styles.money}>${winnings.toLocaleString()}</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} keyboardShouldPersistTaps="always">
        {!question ? (
          <>
            <Text style={styles.sectionTitle}>Pick a Card</Text>
            {availableCategories.map((c, idx) => (
              <Pressable
                key={`${c.grade}-${c.subject}-${idx}`}
                onPress={() => chooseCategory(c)}
                hitSlop={22}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <Text style={styles.cardText}>
                  {c.grade} Grade {c.subject}
                </Text>
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.prompt}>{question.prompt}</Text>

            {question.type === "short" ? (
              <>
                {question.subject === "Spelling" && (
                  <TouchableOpacity activeOpacity={0.85} onPress={playSpellingWord} style={styles.playBtn}>
                    <Text style={styles.playText}>🔊 Play Word</Text>
                  </TouchableOpacity>
                )}

                <TextInput
                  style={styles.input}
                  value={typedAnswer}
                  onChangeText={setTypedAnswer}
                  editable={!revealed}
                  placeholder={question.subject === "Math" ? "Type your answer" : "Type the word"}
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType={question.subject === "Math" ? "numbers-and-punctuation" : "default"}
                />

                {revealed && (
                  <Text style={styles.reveal}>
                    Correct answer: <Text style={styles.revealGold}>{question.displayAnswer}</Text>
                  </Text>
                )}
              </>
            ) : (
              question.choices.map((choice, i) => {
                const selected = selectedAnswer === i;
                const right = revealed && i === question.answer;
                const wrong = revealed && selected && i !== question.answer;

                return (
                  <Pressable
                    key={i}
                    onPress={() => !revealed && setSelectedAnswer(i)}
                    hitSlop={22}
                    style={({ pressed }) => [
                      styles.answer,
                      selected && !revealed && styles.answerSelected,
                      right && styles.answerCorrect,
                      wrong && styles.answerWrong,
                      pressed && !revealed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.answerText}>
                      {String.fromCharCode(65 + i)}. {choice}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {!!question && (
        <View style={styles.bottomBar} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={revealed ? continueGame : submitAnswer}
            disabled={actionDisabled}
            style={[styles.primary, actionDisabled && styles.primaryDisabled]}
          >
            <Text style={styles.primaryText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, padding: 16 },

  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: theme.text, fontWeight: "900", fontSize: 18 },

  homeBtn: {
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  homeText: { color: theme.text, fontWeight: "900" },

  money: { color: theme.gold, fontWeight: "900", textAlign: "center", marginVertical: 10 },

  sectionTitle: { color: theme.text, fontWeight: "900", fontSize: 18, textAlign: "center", marginBottom: 8 },

  card: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  cardText: { color: theme.text, fontWeight: "900", textAlign: "center" },

  prompt: { color: theme.text, fontWeight: "900", fontSize: 18, marginVertical: 10 },

  answer: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 14,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  answerText: { color: theme.text, fontWeight: "800" },
  answerSelected: { borderColor: theme.gold },
  answerCorrect: { borderColor: "#1a7f37" },
  answerWrong: { borderColor: "#b42318" },

  playBtn: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  playText: { color: theme.text, fontWeight: "900" },

  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: Platform.OS === "android" ? 14 : 16,
    borderRadius: 14,
    color: theme.text,
    fontWeight: "800",
  },

  reveal: { marginTop: 10, color: "rgba(255,255,255,0.7)", fontWeight: "900" },
  revealGold: { color: theme.gold, fontWeight: "900" },

  bottomBar: { position: "absolute", left: 16, right: 16, bottom: 16 },

  primary: { backgroundColor: theme.gold, paddingVertical: 20, borderRadius: 16, alignItems: "center" },
  primaryDisabled: { opacity: 0.45 },
  primaryText: { color: "#111", fontWeight: "900", fontSize: 16 },

  pressed: { opacity: 0.75 },
});
