const adjectives = [
  "Other",
  "New",
  "Good",
  "Old",
  "Little",
  "Great",
  "Small",
  "Young",
  "Long",
  "Black",
  "High",
  "Only",
  "Big",
  "White",
  "Political"
];

const nouns = [
  "Man",
  "World",
  "Hand",
  "Room",
  "Face",
  "Thing",
  "Place",
  "Door",
  "Woman",
  "House",
  "Money",
  "Father",
  "Government",
  "Country",
  "Mother"
];

export const username = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}${noun}`;
};
