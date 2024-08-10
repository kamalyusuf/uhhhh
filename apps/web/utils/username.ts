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
  "Political",
  "Red",
  "Blue",
  "Green",
  "Happy",
  "Sad",
  "Bright",
  "Dark",
  "Soft",
  "Hard",
  "Quiet"
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
  "Mother",
  "Car",
  "Tree",
  "Book",
  "City",
  "Dog",
  "Cat",
  "Child",
  "Phone",
  "Computer",
  "Friend"
];

export const username = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}${noun}`;
};
