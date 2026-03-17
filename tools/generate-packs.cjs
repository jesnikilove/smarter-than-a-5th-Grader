const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "data", "packs.generated.json");

function uid(prefix, n) {
  return `${prefix}-${n}-${Math.random().toString(16).slice(2)}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeMC({ grade, subject, prompt, correct, wrongs, hint }) {
  const choices = shuffle([correct, ...wrongs].slice(0, 4));
  const answer = choices.indexOf(correct);
  return { id: uid(`${grade}-${subject}`.replace(/\s+/g, "_"), Date.now()), grade, subject, prompt, choices, answer, hint };
}

function genGrammar(grade, n) {
  const out = [];
  const caps = [
    ["I went to school.", ["i went to school.", "I went To school.", "i Went to school."], "Sentences start with a capital."],
    ["We like pizza.", ["we like pizza.", "WE like pizza.", "We Like pizza."], "Sentences start with a capital."],
    ["My dog is brown.", ["my dog is brown.", "MY dog is brown.", "My Dog is brown."], "Capitalize the first word."],
  ];
  const punct = [
    ["What is your name?", ["What is your name", "What is your name.", "What is your name!"], "Questions end with a ?"],
    ["Stop.", ["Stop", "Stop?", "Stop!"], "A statement can end with a period."],
    ["Wow!", ["Wow", "Wow.", "Wow?"], "Strong feeling = !"],
  ];
  for (let i = 0; i < n; i++) {
    const pick = Math.random() < 0.5 ? caps : punct;
    const [good, wrongs, hint] = pick[Math.floor(Math.random() * pick.length)];
    out.push(makeMC({ grade, subject: "Grammar", prompt: `Grade ${grade} Grammar: Choose the correct sentence.`, correct: good, wrongs, hint }));
  }
  return out;
}

function genAnimalScience(grade, n) {
  const out = [];
  const mammals = ["dog", "cat", "horse", "cow", "whale", "dolphin"];
  const birds = ["eagle", "sparrow", "owl", "penguin"];
  const reptiles = ["snake", "lizard", "turtle", "alligator"];
  const amphibians = ["frog", "salamander", "toad"];
  const fish = ["salmon", "tuna", "goldfish"];

  const templates = [
    () => makeMC({
      grade, subject: "Animal Science",
      prompt: `Grade ${grade} Animal Science: Which one is a mammal?`,
      correct: mammals[Math.floor(Math.random() * mammals.length)],
      wrongs: shuffle([...birds, ...reptiles, ...fish, ...amphibians]).slice(0, 3),
      hint: "Mammals have fur or hair and drink milk as babies.",
    }),
    () => makeMC({
      grade, subject: "Animal Science",
      prompt: `Grade ${grade} Animal Science: Which one is a reptile?`,
      correct: reptiles[Math.floor(Math.random() * reptiles.length)],
      wrongs: shuffle([...birds, ...fish, ...amphibians, ...mammals]).slice(0, 3),
      hint: "Reptiles have scales and are cold-blooded.",
    }),
    () => makeMC({
      grade, subject: "Animal Science",
      prompt: `Grade ${grade} Animal Science: Which animal lives in water and breathes using gills?`,
      correct: fish[Math.floor(Math.random() * fish.length)],
      wrongs: shuffle([...mammals, ...birds, ...reptiles]).slice(0, 3),
      hint: "Fish use gills, not lungs.",
    }),
  ];

  for (let i = 0; i < n; i++) out.push(templates[i % templates.length]());
  return out;
}

function genHealth(grade, n) {
  const out = [];
  const templates = [
    () => makeMC({
      grade, subject: "Health",
      prompt: `Grade ${grade} Health: Which choice is BEST for staying healthy?`,
      correct: "Wash your hands with soap and water.",
      wrongs: ["Never sleep", "Eat candy for every meal", "Skip drinking water"],
      hint: "Clean hands help stop germs.",
    }),
    () => makeMC({
      grade, subject: "Health",
      prompt: `Grade ${grade} Health: What should you do before crossing the street?`,
      correct: "Look left, right, then left again.",
      wrongs: ["Run without looking", "Close your eyes", "Text on your phone"],
      hint: "Check for cars both ways.",
    }),
    () => makeMC({
      grade, subject: "Health",
      prompt: `Grade ${grade} Health: Which is a healthy drink?`,
      correct: "Water",
      wrongs: ["Soda", "Energy drink", "Candy shake"],
      hint: "Your body needs water.",
    }),
  ];
  for (let i = 0; i < n; i++) out.push(templates[i % templates.length]());
  return out;
}

function genPE(grade, n) {
  const out = [];
  const templates = [
    () => makeMC({
      grade, subject: "Physical Education",
      prompt: `Grade ${grade} PE: What is a good warm-up before running?`,
      correct: "Light jogging or dynamic stretching",
      wrongs: ["Sitting still for 10 minutes", "Eating a big meal", "Sleeping"],
      hint: "Warm-ups get your body ready to move.",
    }),
    () => makeMC({
      grade, subject: "Physical Education",
      prompt: `Grade ${grade} PE: Which activity improves your heart and lungs?`,
      correct: "Running",
      wrongs: ["Watching TV", "Sitting quietly", "Playing video games"],
      hint: "Cardio activities raise your heart rate.",
    }),
    () => makeMC({
      grade, subject: "Physical Education",
      prompt: `Grade ${grade} PE: What should you do if you feel dizzy during exercise?`,
      correct: "Stop, sit down, and tell an adult.",
      wrongs: ["Keep going no matter what", "Hold your breath", "Ignore it"],
      hint: "Safety first.",
    }),
  ];
  for (let i = 0; i < n; i++) out.push(templates[i % templates.length]());
  return out;
}

function genScience(grade, n) {
  const out = [];
  const templates3 = [
    () => makeMC({
      grade, subject: "Science",
      prompt: `Grade ${grade} Science: Which is a state of matter?`,
      correct: "Solid",
      wrongs: ["Shadow", "Sound", "Time"],
      hint: "Matter can be solid, liquid, or gas.",
    }),
    () => makeMC({
      grade, subject: "Science",
      prompt: `Grade ${grade} Science: Plants make food using sunlight. This is called…`,
      correct: "Photosynthesis",
      wrongs: ["Evaporation", "Condensation", "Erosion"],
      hint: "It starts with 'photo' (light).",
    }),
    () => makeMC({
      grade, subject: "Science",
      prompt: `Grade ${grade} Science: Which tool measures temperature?`,
      correct: "Thermometer",
      wrongs: ["Ruler", "Scale", "Compass"],
      hint: "It tells how hot or cold something is.",
    }),
  ];
  const templates5 = [
    () => makeMC({
      grade, subject: "Science",
      prompt: `Grade ${grade} Science: Which part of a plant absorbs water from the soil?`,
      correct: "Roots",
      wrongs: ["Leaves", "Flowers", "Seeds"],
      hint: "It’s underground.",
    }),
    () => makeMC({
      grade, subject: "Science",
      prompt: `Grade ${grade} Science: Which is an example of a renewable resource?`,
      correct: "Sunlight",
      wrongs: ["Coal", "Oil", "Natural gas"],
      hint: "It won’t run out the way fossil fuels do.",
    }),
    () => makeMC({
      grade, subject: "Science",
      prompt: `Grade ${grade} Science: What force pulls objects toward Earth?`,
      correct: "Gravity",
      wrongs: ["Friction", "Magnetism", "Electricity"],
      hint: "It keeps you from floating away.",
    }),
  ];
  const bank = grade >= 5 ? templates5 : templates3;
  for (let i = 0; i < n; i++) out.push(bank[i % bank.length]());
  return out;
}

function genSocialStudies(grade, n) {
  const out = [];
  const templates = [
    () => makeMC({
      grade, subject: "Social Studies",
      prompt: `Grade ${grade} Social Studies: Which is an example of a rule?`,
      correct: "Raise your hand before speaking.",
      wrongs: ["Your favorite color", "A sandwich", "A cloud"],
      hint: "Rules help keep places safe and fair.",
    }),
    () => makeMC({
      grade, subject: "Social Studies",
      prompt: `Grade ${grade} Social Studies: A person who leads a city is often called a…`,
      correct: "Mayor",
      wrongs: ["Chef", "Pilot", "Artist"],
      hint: "This leader helps run a city.",
    }),
    () => makeMC({
      grade, subject: "Social Studies",
      prompt: `Grade ${grade} Social Studies: What does “community” mean?`,
      correct: "People living and working in the same area",
      wrongs: ["Only one person", "A type of animal", "A TV show"],
      hint: "It’s a group of people in one place.",
    }),
  ];
  for (let i = 0; i < n; i++) out.push(templates[i % templates.length]());
  return out;
}

function genWorldGeography(grade, n) {
  const out = [];
  const templates = [
    () => makeMC({
      grade, subject: "World Geography",
      prompt: `Grade ${grade} World Geography: Which is a continent?`,
      correct: "Africa",
      wrongs: ["Pacific Ocean", "Greenland", "Amazon River"],
      hint: "Continents are large land masses.",
    }),
    () => makeMC({
      grade, subject: "World Geography",
      prompt: `Grade ${grade} World Geography: What is a map key (legend) used for?`,
      correct: "Explaining what symbols mean on a map",
      wrongs: ["Telling the weather", "Measuring time", "Making music"],
      hint: "It explains symbols and colors.",
    }),
    () => makeMC({
      grade, subject: "World Geography",
      prompt: `Grade ${grade} World Geography: Lines of latitude run…`,
      correct: "East and west",
      wrongs: ["North and south", "Only in oceans", "Only on mountains"],
      hint: "Latitude lines go around Earth like belts.",
    }),
  ];
  for (let i = 0; i < n; i++) out.push(templates[i % templates.length]());
  return out;
}

const bank = [
  ...genGrammar(1, 1200),
  ...genAnimalScience(2, 1200),
  ...genHealth(2, 1200),
  ...genPE(3, 1200),
  ...genScience(3, 1500),
  ...genSocialStudies(4, 1200),
  ...genScience(5, 1500),
  ...genWorldGeography(5, 1200),
];

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(bank, null, 2), "utf8");
console.log(`✅ Generated ${bank.length} MC questions -> ${OUT}`);
