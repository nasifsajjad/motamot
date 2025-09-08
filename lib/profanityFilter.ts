// lib/profanityFilter.ts
const profanityWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy'
  // Add more words here
];

const profanityRegex = new RegExp(profanityWords.join('|'), 'i');

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  // Normalize text to handle various cases, like "f.u.c.k" or "f_u_c_k"
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return profanityRegex.test(normalizedText);
};