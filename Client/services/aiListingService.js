import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.FASTAPI_BASE_URL;

/**
 * Fetches the next question from the backend
 */
export const askQuestion = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/listing/question`);
    return await res.json(); // { question: "What is the machine category?" }
  } catch (err) {
    console.error("askQuestion error:", err);
    return { question: "Something went wrong. Try again." };
  }
};

/**
 * Sends user answer to backend.
 * Can send text or voice (base64 mp3).
 * @param {string} answerText - typed answer
 * @param {string} voiceBase64 - optional base64 mp3
 * @returns {Promise<object>} - backend response: { question, done, machineData }
 */
export const sendAnswer = async (answerText = null, voiceBase64 = null) => {
  try {
    const body = {};

    if (answerText) body.answerText = answerText;
    if (voiceBase64) body.voiceMp3 = voiceBase64;

    const res = await fetch(`${API_BASE_URL}/ai/listing/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    // Example response:
    // { done: true, machineData: { category: "Tractor", toolName: "Mini Tractor", rentalPrice: 350, duration: "hour", availableHours: 8, power: "18HP", fuelType: "Diesel", weight: "850kg" } }
    return data;
  } catch (err) {
    console.error("sendAnswer error:", err);
    return { done: true, machineData: null };
  }
};
