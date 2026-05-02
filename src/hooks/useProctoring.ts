import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface ProctoringState {
  webcamStream: MediaStream | null;
  webcamError: string | null;
  audioLevel: number;
  violations: ProctoringViolation[];
  violationCount: number;
  isFullscreen: boolean;
  webcamRef: React.RefObject<HTMLVideoElement>;
  currentWarning: string | null; // Immediate prominent UI warning
  startProctoring: () => Promise<void>;
  stopProctoring: () => void;
  isModelLoading: boolean;
}

export interface ProctoringViolation {
  type: 'tab_switch' | 'fullscreen_exit' | 'audio_spike' | 'webcam_lost' | 'device_detected' | 'multiple_people' | 'face_missing';
  timestamp: number;
  message: string;
}

export function useProctoring(enabled: boolean = false): ProctoringState {
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const webcamRef = useRef<HTMLVideoElement>(null!);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const visionIntervalRef = useRef<number | null>(null);
  const audioSpikeCountRef = useRef(0);
  
  // To prevent spamming the exact same violation every 2 seconds
  const lastViolationTypeRef = useRef<string | null>(null);
  const warningClearTimeoutRef = useRef<number | null>(null);

  const showWarning = useCallback((message: string) => {
    setCurrentWarning(message);
    if (warningClearTimeoutRef.current) clearTimeout(warningClearTimeoutRef.current);
    warningClearTimeoutRef.current = window.setTimeout(() => {
      setCurrentWarning(null);
    }, 4000);
  }, []);

  const addViolation = useCallback((type: ProctoringViolation['type'], message: string) => {
    if (lastViolationTypeRef.current !== type) {
      setViolations(prev => [...prev, { type, timestamp: Date.now(), message }]);
      lastViolationTypeRef.current = type;
      // Reset the spam block after 10 seconds so it can be logged again if it continues
      setTimeout(() => { lastViolationTypeRef.current = null; }, 10000);
    }
  }, []);

  // --- Tab Switch Detection ---
  useEffect(() => {
    if (!enabled) return;
    const handleVisibility = () => {
      if (document.hidden) {
        addViolation('tab_switch', 'You switched away from the test tab');
        showWarning("WARNING: Do not switch tabs!");
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, addViolation, showWarning]);

  // --- Fullscreen Detection ---
  useEffect(() => {
    if (!enabled) return;
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);
      if (!isFS && enabled) {
        addViolation('fullscreen_exit', 'You exited fullscreen mode');
        showWarning("WARNING: Return to Fullscreen immediately!");
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [enabled, addViolation, showWarning]);

  // --- Audio Level Monitoring ---
  const startAudioMonitoring = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      audioIntervalRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        
        // Human voice only triggers a few frequency bins. 
        // We should measure the PEAK volume, not the average of all bins.
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > peak) peak = dataArray[i];
        }
        
        const normalized = Math.min(100, Math.round((peak / 255) * 100));
        setAudioLevel(normalized);

        // If audio is consistently high (talking), flag it
        if (normalized > 30) {
          audioSpikeCountRef.current++;
          if (audioSpikeCountRef.current >= 4) { // ~2 seconds of sustained noise
            addViolation('audio_spike', 'Sustained audio/talking detected');
            showWarning("WARNING: Talking or loud noise detected!");
            audioSpikeCountRef.current = 0;
          }
        } else {
          audioSpikeCountRef.current = Math.max(0, audioSpikeCountRef.current - 1);
        }
      }, 500);
    } catch {
      console.warn('Audio monitoring not available');
    }
  }, [addViolation, showWarning]);

  // --- Computer Vision Tracking (COCO-SSD) ---
  const startVisionTracking = useCallback(async () => {
    try {
      setIsModelLoading(true);
      await tf.ready(); // Ensure TF backend is initialized
      const model = await cocoSsd.load();
      setIsModelLoading(false);

      visionIntervalRef.current = window.setInterval(async () => {
        if (!webcamRef.current || webcamRef.current.readyState !== 4) return;

        const predictions = await model.detect(webcamRef.current);
        
        const persons = predictions.filter(p => p.class === 'person');
        const phones = predictions.filter(p => p.class === 'cell phone' || p.class === 'laptop' || p.class === 'tv');

        if (phones.length > 0) {
          addViolation('device_detected', 'Electronic device detected in frame');
          showWarning("WARNING: Electronic device detected!");
        } else if (persons.length > 1) {
          addViolation('multiple_people', 'Multiple people detected in frame');
          showWarning("WARNING: Multiple people detected in frame!");
        } else if (persons.length === 0) {
          addViolation('face_missing', 'Face not visible in frame');
          showWarning("WARNING: Face not visible!");
        }

      }, 2000); // Check every 2 seconds to save CPU
    } catch (e) {
      console.error("Failed to load vision model:", e);
      setIsModelLoading(false);
    }
  }, [addViolation, showWarning]);

  // --- Start Proctoring ---
  const startProctoring = useCallback(async () => {
    // Request webcam + microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: true,
      });
      
      setWebcamStream(stream);
      setWebcamError(null);

      // Audio monitoring
      startAudioMonitoring(stream);

      // Vision tracking
      startVisionTracking();

      // Enter fullscreen
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        console.warn('Fullscreen request denied');
      }
    } catch (err: any) {
      setWebcamError(err.message || 'Could not access camera/microphone');
    }
  }, [startAudioMonitoring, startVisionTracking]);

  // --- Stop Proctoring ---
  const stopProctoring = useCallback(() => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    if (warningClearTimeoutRef.current) clearTimeout(warningClearTimeoutRef.current);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [webcamStream]);

  // Cleanup on unmount
  useEffect(() => {
    return stopProctoring;
  }, [stopProctoring]);

  return {
    webcamStream,
    webcamError,
    audioLevel,
    violations,
    violationCount: violations.length,
    isFullscreen,
    webcamRef,
    currentWarning,
    startProctoring,
    stopProctoring,
    isModelLoading
  };
}
