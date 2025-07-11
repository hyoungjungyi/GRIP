// utils.ts
// Utility functions for pitch processing

/**
 * Converts frequency in Hz to the closest musical note name and its deviation in cents.
 * @param frequency - Detected frequency in Hz
 * @returns An object with note name and cents deviation
 */
export function getNoteFromFrequency(frequency: number) {
  const A4 = 440;
  const SEMITONE = 69;
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const noteNumber = 12 * Math.log2(frequency / A4) + SEMITONE;
  const roundedNote = Math.round(noteNumber);
  const cents = Math.floor((noteNumber - roundedNote) * 100);

  const noteIndex = (roundedNote + 1200) % 12; // normalize for octave wrapping
  const noteName = noteNames[noteIndex];

  return {
    note: noteName,
    cents,
    octave: Math.floor(roundedNote / 12) - 1,
  };
}
