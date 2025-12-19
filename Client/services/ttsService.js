import * as Speech from "expo-speech";

let isSpeaking = false;

/**
 * Toggle speaking text. If currently speaking, stops; otherwise starts.
 * @param {string} text
 * @param {string} language
 * @returns {boolean} current speaking state
 */
export const toggleSpeaking = (text, language) => {
  if (isSpeaking) {
    Speech.stop();
    isSpeaking = false;
  } else {
    Speech.speak(text, {
      language: language === "EN" ? "en-US" : "ne",
      pitch: 1.0,
      rate: 1.0,
    });
    isSpeaking = true;
  }
  return isSpeaking;
};

/**
 * Stop speech (for cleanup)
 */
export const stopSpeaking = () => {
  Speech.stop();
  isSpeaking = false;
};
