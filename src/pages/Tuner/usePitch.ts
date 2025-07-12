import { useEffect, useRef, useState } from "react";

function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number
): number | null {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null;

  let lastCorrelation = 1;
  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }

  return null;
}

export function usePitch() {
  const [pitch, setPitch] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const buffer = useRef<Float32Array>(new Float32Array(2048));
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log("[usePitch] mount");

    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("[usePitch] mic started");
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      const update = () => {
        if (!isMounted) return;

        analyser.getFloatTimeDomainData(buffer.current);
        const detectedPitch = autoCorrelate(
          buffer.current,
          audioContext.sampleRate
        );
        if (detectedPitch && detectedPitch >= 50 && detectedPitch <= 1000) {
          const jitteredPitch = detectedPitch + Math.random() * 0.00001;
          setPitch(jitteredPitch);
        } else {
          const placeholderPitch = 0;
          const jitterPlaceholder = placeholderPitch + Math.random() * 0.00001;
          setPitch(jitterPlaceholder);
        }
        requestAnimationFrame(update);
      };
      update();
    }

    init();

    return () => {
      isMounted = false;
      audioContextRef.current?.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        console.log("[usePitch] mic stopped");
      }
      console.log("[usePitch] unmount");
    };
  }, []);

  return pitch;
}
