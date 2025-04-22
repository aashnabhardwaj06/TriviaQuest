import { useEffect, useRef, useState } from "react";

type SoundType = "click" | "correct" | "wrong" | "success" | "powerup";

export function useSoundEffect() {
  const [isMuted, setIsMuted] = useState(false);
  const soundsRef = useRef<Record<SoundType, HTMLAudioElement | null>>({
    click: null,
    correct: null,
    wrong: null,
    success: null,
    powerup: null
  });
  
  useEffect(() => {
    // Initialize sound effects
    soundsRef.current = {
      click: new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"),
      correct: new Audio("https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3"),
      wrong: new Audio("https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3"),
      success: new Audio("https://assets.mixkit.co/active_storage/sfx/956/956-preview.mp3"),
      powerup: new Audio("https://assets.mixkit.co/active_storage/sfx/273/273-preview.mp3")
    };
    
    // Clean up
    return () => {
      Object.values(soundsRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []);
  
  const playSound = (type: SoundType) => {
    if (isMuted) return;
    
    const sound = soundsRef.current[type];
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.3; // Lower volume
      sound.play().catch(err => console.log("Error playing sound:", err));
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  return { playSound, toggleMute, isMuted };
}
