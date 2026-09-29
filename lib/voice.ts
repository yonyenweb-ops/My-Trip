// Turns a spoken sentence ("coffee 2 dollars", "tuk tuk 5000 riel", "កាហ្វេ ២ពាន់រៀល")
// into expense form values. Pure functions, no browser APIs.

import type { Currency } from "./money";

export type VoiceLang = "en-US" | "km-KH";

export interface VoiceExpense {
  amount?: string; // value for the amount field, in `currency` units
  currency?: Currency;
  category?: string;
  description: string;
}

const KH_DIGITS = "០១២៣៤៥៦៧៨៩";
const toAsciiDigits = (s: string) => s.replace(/[០-៩]/g, (d) => String(KH_DIGITS.indexOf(d)));

// Khmer number words. Longest first so "ប្រាំពីរ" (7) wins over "ប្រាំ" (5).
const KH_NUMBER_WORDS: [string, number, "unit" | "mult"][] = (
  [
    ["ប្រាំបួន", 9], ["ប្រាំបី", 8], ["ប្រាំពីរ", 7], ["ប្រាំមួយ", 6], ["ប្រាំ", 5],
    ["មួយ", 1], ["ពីរ", 2], ["បី", 3], ["បួន", 4],
    ["ដប់", 10], ["ម្ភៃ", 20], ["សាមសិប", 30], ["សែសិប", 40], ["ហាសិប", 50],
    ["ហុកសិប", 60], ["ចិតសិប", 70], ["ប៉ែតសិប", 80], ["កៅសិប", 90],
  ] as [string, number][]
)
  .map(([w, n]): [string, number, "unit" | "mult"] => [w, n, "unit"])
  .concat([
    ["រយ", 100, "mult"], ["ពាន់", 1000, "mult"], ["ម៉ឺន", 10000, "mult"], ["សែន", 100000, "mult"], ["លាន", 1000000, "mult"],
  ])
  .sort((a, b) => b[0].length - a[0].length);

const MULTIPLIERS: Record<string, number> = {
  k: 1000, thousand: 1000, hundred: 100, million: 1000000,
  រយ: 100, ពាន់: 1000, ម៉ឺន: 10000, សែន: 100000, លាន: 1000000,
};

/** Finds the first run of Khmer number words, e.g. "ពីរពាន់ប្រាំរយ" = 2500. */
function findKhmerNumber(text: string): { value: number; start: number; end: number } | null {
  for (let i = 0; i < text.length; i++) {
    let pos = i;
    let total = 0;
    let current = 0;
    let matched = false;
    while (pos < text.length) {
      if (matched && text[pos] === " ") {
        pos++;
        continue;
      }
      const hit = KH_NUMBER_WORDS.find(([w]) => text.startsWith(w, pos));
      if (!hit) break;
      const [word, n, kind] = hit;
      if (kind === "unit") current += n;
      else if (n >= 1000) {
        total += (current || 1) * n;
        current = 0;
      } else current = (current || 1) * n;
      pos += word.length;
      matched = true;
    }
    if (matched) return { value: total + current, start: i, end: pos };
  }
  return null;
}

// English number words: phones often write small numbers as words ("food five dollars").
const EN_UNITS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const EN_MULT: Record<string, number> = { hundred: 100, thousand: 1000, million: 1000000 };

/** Finds the first run of English number words, e.g. "twenty five" = 25, "two point five" = 2.5. */
function findEnglishNumber(text: string): { value: number; start: number; end: number } | null {
  const words = [...text.matchAll(/[a-z]+/gi)].map((m) => ({ w: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length }));
  const isNum = (i: number) =>
    !!words[i] && (words[i].w in EN_UNITS || words[i].w in EN_MULT || (words[i].w === "a" && words[i + 1]?.w in EN_MULT));

  for (let i = 0; i < words.length; i++) {
    if (!isNum(i)) continue;
    let total = 0;
    let current = 0;
    let j = i;
    for (; j < words.length; j++) {
      const { w } = words[j];
      if (w === "a" && isNum(j)) current = 1;
      else if (w in EN_UNITS) current += EN_UNITS[w];
      else if (w === "hundred") current = (current || 1) * 100;
      else if (w in EN_MULT) {
        total += (current || 1) * EN_MULT[w];
        current = 0;
      } else if (w === "and" && isNum(j + 1)) continue;
      else break;
    }
    let value = total + current;
    let end = words[j - 1].end;
    // "two point five" -> 2.5
    if (words[j]?.w === "point") {
      let decimals = "";
      let k = j + 1;
      for (; k < words.length && words[k].w in EN_UNITS && EN_UNITS[words[k].w] < 10; k++) decimals += EN_UNITS[words[k].w];
      if (decimals) {
        value = Number(`${value}.${decimals}`);
        end = words[k - 1].end;
      }
    }
    if (value > 0) return { value, start: words[i].start, end };
  }
  return null;
}

/** First number in the text: "2.50", "5,000", "$3", "2k", "2 thousand", "២ពាន់", "ពីរពាន់", "five". */
function findNumber(text: string): { value: number; start: number; end: number } | null {
  const m = /(\d[\d,]*(?:\.\d+)?)\s*(k\b|thousand\b|hundred\b|million\b|រយ|ពាន់|ម៉ឺន|សែន|លាន)?/i.exec(text);
  if (m) {
    const base = Number(m[1].replace(/,/g, ""));
    const mult = m[2] ? MULTIPLIERS[m[2].toLowerCase()] : 1;
    if (Number.isFinite(base) && base > 0) return { value: base * mult, start: m.index, end: m.index + m[0].length };
  }
  return findKhmerNumber(text) ?? findEnglishNumber(text);
}

const RIEL = /riel|reil|\breal\b|៛|រៀល|\bkhr\b/i;
const DOLLAR = /\$|dollars?|\bbucks?\b|\busd\b|ដុល្លារ|ដុល្លា/i;
const CENTS = /\bcents?\b|សេន/i;

// Category keywords (English matched as whole words, Khmer as substrings).
const KEYWORDS: [string, string[], string[]][] = [
  ["Drink", ["drink", "drinks", "coffee", "tea", "water", "beer", "juice", "soda", "coke", "smoothie", "milk", "latte", "wine"], ["កាហ្វេ", "តែ", "ទឹក", "ស្រាបៀរ", "ភេសជ្ជៈ", "ស្រា"]],
  ["Food", ["food", "eat", "ate", "lunch", "dinner", "breakfast", "rice", "noodle", "noodles", "soup", "bbq", "restaurant", "snack", "snacks", "fruit", "meal", "bread", "pizza", "burger"], ["បាយ", "ម្ហូប", "អាហារ", "គុយទាវ", "នំ", "ផ្លែឈើ", "ញ៉ាំ", "មី"]],
  ["Transport", ["tuk", "tuktuk", "taxi", "grab", "passapp", "bus", "moto", "motorbike", "fuel", "gas", "petrol", "train", "ferry", "boat", "flight", "parking", "car", "ride"], ["តុកតុក", "ឡាន", "ម៉ូតូ", "សាំង", "ទូក", "កង់", "យន្តហោះ", "រ៉ឺម៉ក"]],
  ["Hotel", ["hotel", "room", "guesthouse", "hostel", "resort", "airbnb", "homestay"], ["សណ្ឋាគារ", "ផ្ទះសំណាក់", "បន្ទប់", "ផ្ទះស្នាក់"]],
  ["Entrance Fee", ["ticket", "tickets", "entrance", "entry", "admission", "temple", "museum", "pass"], ["សំបុត្រ", "ថ្លៃចូល", "ប្រាសាទ"]],
  ["Entertainment", ["movie", "cinema", "karaoke", "massage", "spa", "game", "games", "party", "club", "bar", "concert"], ["ម៉ាស្សា", "ខារ៉ាអូខេ", "កុន", "ភាពយន្ត", "លេង"]],
  ["Shopping", ["shop", "shopping", "buy", "bought", "souvenir", "souvenirs", "clothes", "shirt", "market", "gift", "gifts"], ["ទិញ", "ផ្សារ", "អាវ", "កាដូ", "ខោ"]],
];

function findCategory(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [category, en, km] of KEYWORDS) {
    if (en.some((w) => new RegExp(`\\b${w}\\b`).test(lower)) || km.some((w) => text.includes(w))) return category;
  }
  return undefined;
}

// Words that only carry the amount/currency or filler, removed from the description.
const FILLER =
  /\$|\b(dollars?|bucks?|usd|riel|reil|real|khr|cents?|i|paid|pay|spent|spend|for|on|about|around|of|and|thousand|hundred|k)\b|៛|រៀល|ដុល្លារ|ដុល្លា|សេន|ចំណាយ|អស់/gi;

/** Riel is the usual currency for big round numbers in Cambodia, so bare amounts of 500+ are riel. */
const RIEL_GUESS_MIN = 500;

export function parseVoiceExpense(transcript: string): VoiceExpense {
  const text = toAsciiDigits(transcript.trim());
  const num = findNumber(text);
  const category = findCategory(text);

  let amount: string | undefined;
  let currency: Currency | undefined;
  if (num) {
    if (CENTS.test(text) && !DOLLAR.test(text) && num.value < 100) {
      currency = "USD";
      amount = String(num.value / 100);
    } else if (RIEL.test(text)) {
      currency = "KHR";
      amount = String(Math.round(num.value));
    } else if (DOLLAR.test(text)) {
      currency = "USD";
      amount = String(Math.round(num.value * 100) / 100);
    } else if (num.value >= RIEL_GUESS_MIN && Number.isInteger(num.value)) {
      currency = "KHR";
      amount = String(num.value);
    } else {
      currency = "USD";
      amount = String(Math.round(num.value * 100) / 100);
    }
  }

  const rest = num ? text.slice(0, num.start) + " " + text.slice(num.end) : text;
  const cleaned = rest
    .replace(FILLER, " ")
    .replace(/[.,!?;:។]+/g, " ") // leftover punctuation from the speech engine
    .replace(/\s+/g, " ")
    .trim();
  const description = cleaned ? cleaned[0].toUpperCase() + cleaned.slice(1) : "";

  return { amount, currency, category, description };
}
