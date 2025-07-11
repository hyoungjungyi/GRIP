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

export function getClosestString(frequency: number): string | null {
  const stringFrequencies = {
    E: 82.41, // E2
    A: 110.0, // A2
    D: 146.83, // D3
    G: 196.0, // G3
    B: 246.94, // B3
    e: 329.63, // E4
  };

  const threshold = 10; // Hz
  let closestString: string | null = null;
  let minDifference = Infinity;

  for (const [stringName, stringFreq] of Object.entries(stringFrequencies)) {
    const difference = Math.abs(frequency - stringFreq);
    if (difference < minDifference) {
      minDifference = difference;
      closestString = stringName;
    }
  }

  return minDifference <= threshold ? closestString : null;
}
