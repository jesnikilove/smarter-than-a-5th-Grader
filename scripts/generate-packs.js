const fs = require("fs");
const path = require("path");
// data/packs.ts
export type MCQ = {
  id: string;
  grade: number;
  subject: string;
  prompt: string;
  choices: string[];
  answer: number; // index 0-3
  hint: string;
};

import PACK from "./packs.generated.json";


  return (PACK as MCQ[]) ?? [];
}
