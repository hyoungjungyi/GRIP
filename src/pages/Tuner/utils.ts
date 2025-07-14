// utils.ts
// Utility functions for pitch processing

/**
 * Converts frequency in Hz to the closest musical note name and its deviation in cents.
 * @param frequency - Detected frequency in Hz
 * @returns An object with note name, cents deviation, and target frequency
 */
export function frequencyToNote(frequency: number) {
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
  const octave = Math.floor(roundedNote / 12) - 1;

  // 목표 주파수 계산
  const targetFrequency = A4 * Math.pow(2, (roundedNote - SEMITONE) / 12);

  return {
    note: noteName,
    cents,
    octave,
    targetFrequency,
    fullNote: `${noteName}${octave}`,
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

  const threshold = 30; // Hz - 임계값 줄임
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

/**
 * 기타 줄의 목표 주파수를 반환합니다.
 * @param stringName - 기타 줄 이름 (E, A, D, G, B, e)
 * @returns 목표 주파수 (Hz)
 */
export function getTargetFrequency(stringName: string): number {
  const stringFrequencies: { [key: string]: number } = {
    E: 82.41, // E2
    A: 110.0, // A2
    D: 146.83, // D3
    G: 196.0, // G3
    B: 246.94, // B3
    e: 329.63, // E4
  };

  return stringFrequencies[stringName] || 440; // 기본값 A4
}

/**
 * 음정 정확도를 백분율로 계산합니다.
 * @param currentFreq - 현재 감지된 주파수
 * @param targetFreq - 목표 주파수
 * @returns 정확도 (0-100%)
 */
export function calculateAccuracy(
  currentFreq: number,
  targetFreq: number
): number {
  const cents = 1200 * Math.log2(currentFreq / targetFreq);
  const maxCents = 50; // ±50센트를 100% 정확도 범위로 설정
  return Math.max(0, Math.min(100, 100 - (Math.abs(cents) / maxCents) * 100));
}

/**
 * 기타 줄을 기준으로 주파수를 분석합니다.
 * @param frequency - 감지된 주파수
 * @returns 가장 가까운 기타 줄 정보와 센트 편차
 */
export function getGuitarStringInfo(frequency: number) {
  const stringFrequencies = {
    E: 82.41, // E2 (6번째 줄)
    A: 110.0, // A2 (5번째 줄)
    D: 146.83, // D3 (4번째 줄)
    G: 196.0, // G3 (3번째 줄)
    B: 246.94, // B3 (2번째 줄)
    e: 329.63, // E4 (1번째 줄)
  };

  let closestString: string | null = null;
  let minDifference = Infinity;
  let targetFrequency = 0;

  // 가장 가까운 기타 줄 찾기
  for (const [stringName, stringFreq] of Object.entries(stringFrequencies)) {
    const difference = Math.abs(frequency - stringFreq);
    if (difference < minDifference) {
      minDifference = difference;
      closestString = stringName;
      targetFrequency = stringFreq;
    }
  }

  if (!closestString) {
    return null;
  }

  // 센트 편차 계산 (기타 줄 기준)
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));

  // 디버깅 로그 추가
  console.log("[🔍 Guitar String Analysis]", {
    frequency: frequency.toFixed(2),
    closestString,
    targetFrequency: targetFrequency.toFixed(2),
    cents,
    minDifference: minDifference.toFixed(2),
    withinRange: Math.abs(cents) <= 200,
  });

  // 기타 줄 범위를 완화 (±200센트 = 약 2세미톤)
  if (Math.abs(cents) > 200) {
    console.log("[❌ Out of range]", { cents, limit: 200 });
    return null;
  }

  return {
    stringName: closestString,
    targetFrequency,
    currentFrequency: frequency,
    cents,
    isInTune: Math.abs(cents) < 10, // ±10센트 이내면 튜닝됨
  };
}
