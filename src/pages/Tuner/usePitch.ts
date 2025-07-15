import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";

export function usePitch() {
  const [pitch, setPitch] = useState<number | null>(null);
  const [inputLevel, setInputLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Pitchy 감지기
  const pitchDetectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log("[🎵 Pitchy] Initializing...");

    async function init() {
      try {
        // 마이크 권한 요청
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100,
          },
        });
        streamRef.current = stream;

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // Pitchy에 최적화된 크기
        analyser.smoothingTimeConstant = 0.1; // 빠른 반응
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        // Pitchy 감지기 초기화
        const bufferSize = analyser.fftSize;
        bufferRef.current = new Float32Array(bufferSize);
        pitchDetectorRef.current = PitchDetector.forFloat32Array(bufferSize);

        console.log("[✅ Pitchy] Initialized successfully", {
          bufferSize,
          sampleRate: audioContext.sampleRate,
        });

        const update = () => {
          if (!isMounted) return;

          analyser.getFloatTimeDomainData(bufferRef.current!);

          // 입력 레벨 계산
          const maxAmplitude = Math.max(...Array.from(bufferRef.current!).map(Math.abs));
          setInputLevel(Math.min(maxAmplitude * 8, 1));

          // Pitchy로 피치 감지
          try {
            const [frequency, clarity] = pitchDetectorRef.current!.findPitch(
              bufferRef.current!, 
              audioContext.sampleRate
            );

            // 디버깅: 모든 감지 결과 로그 (가끔)
            if (Math.random() < 0.05) {
              console.log("[🔍 Pitchy Raw]", {
                frequency: frequency.toFixed(2),
                clarity: clarity.toFixed(3),
                inputLevel: maxAmplitude.toFixed(4),
                inRange: frequency >= 60 && frequency <= 400,
                clarityThreshold: 0.5
              });
            }

            // 조건 완화: clarity > 0.5, 범위 확장
            if (clarity > 0.5 && frequency >= 60 && frequency <= 400 && maxAmplitude > 0.01) {
              setPitch(frequency);
              
              // 성공적인 감지 로그
              if (Math.random() < 0.02) {
                console.log("[🎯 Pitchy Detection SUCCESS]", {
                  frequency: frequency.toFixed(2),
                  clarity: clarity.toFixed(3),
                  inputLevel: maxAmplitude.toFixed(4)
                });
              }
            } else {
              // 신뢰도가 낮거나 범위를 벗어나면 null
              if (pitch !== null) {
                setPitch(null);
                // 실패 이유 로그
                if (Math.random() < 0.01) {
                  console.log("[❌ Pitchy Detection FAILED]", {
                    frequency: frequency.toFixed(2),
                    clarity: clarity.toFixed(3),
                    inputLevel: maxAmplitude.toFixed(4),
                    reasons: {
                      lowClarity: clarity <= 0.5,
                      outOfRange: frequency < 60 || frequency > 400,
                      lowInput: maxAmplitude <= 0.01
                    }
                  });
                }
              }
            }
          } catch (err) {
            // Pitchy 오류 처리
            if (Math.random() < 0.001) {
              console.warn("[⚠️ Pitchy Error]", err);
            }
          }

          requestAnimationFrame(update);
        };
        
        update();
      } catch (err) {
        console.error("[❌ usePitch] Failed to initialize:", err);
        
        if (err instanceof DOMException) {
          switch (err.name) {
            case "NotAllowedError":
              setError("마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.");
              break;
            case "NotFoundError":
              setError("마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.");
              break;
            case "NotReadableError":
              setError("마이크에 접근할 수 없습니다. 다른 앱에서 사용 중일 수 있습니다.");
              break;
            default:
              setError(`마이크 오류: ${err.message}`);
          }
        } else {
          setError(err instanceof Error ? err.message : "알 수 없는 오류");
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      console.log("[🧹 Cleanup] Starting cleanup...");

      // 상태 초기화
      setPitch(null);
      setInputLevel(0);

      // 오디오 컨텍스트 정리
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Pitchy 관련 정리
      pitchDetectorRef.current = null;
      bufferRef.current = null;

      console.log("[✅ Cleanup] Complete");
    };
  }, []);

  return { pitch, error, inputLevel };
}
