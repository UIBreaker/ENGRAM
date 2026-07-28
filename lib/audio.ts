// Robust Text-to-Speech audio helper with dual fallback

let currentAudio: HTMLAudioElement | null = null;

export function speakWord(text: string, e?: React.MouseEvent | React.TouchEvent) {
  if (e) {
    e.stopPropagation();
  }

  if (!text || typeof window === "undefined") return;

  const cleanText = text.trim();

  // Try 1: Web Speech Synthesis API
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel(); // stop previous speech
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      
      // Select best English voice if available
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Daniel")));
      if (enVoice) utterance.voice = enVoice;

      window.speechSynthesis.speak(utterance);
      return;
    } catch (err) {
      console.warn("speechSynthesis failed, trying audio fallback", err);
    }
  }

  // Try 2: Google TTS Audio Fallback
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(cleanText)}&tl=en`;
    const audio = new Audio(ttsUrl);
    currentAudio = audio;
    audio.play().catch(err => console.warn("Google TTS audio playback failed", err));
  } catch (err) {
    console.error("Audio playback error:", err);
  }
}
