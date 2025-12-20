// services/aiListingService.js
import { Platform } from "react-native";
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.FASTAPI_BASE_URL || "https://fastapi-backend-rt5r.onrender.com";


console.log("API URL:", API_BASE_URL, "Platform:", Platform.OS);



export const askQuestion = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/next?session_id='55'`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    return await response.json();
  } catch (error) {
    return {
      question: `Cannot connect to server.\nError: ${error.message}\nURL: ${API_BASE_URL}`
    };
  }
};

export const sendAnswer = async (answerText = null, voiceUri = null) => {
  try {
    const formData = new FormData();
    formData.append('session_id', '1');
    
    if (answerText) formData.append('text', answerText);
    
    if (voiceUri) {
      const filename = voiceUri.split('/').pop() || 'audio.mp3';
      formData.append('audio', {
        uri: voiceUri,
        type: 'audio/mp3',
        name: filename,
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/next`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    return await response.json();
  } catch (error) {
    return {
      done: false,
      question: `Error: ${error.message}`
    };
  }
};

export const getApiUrl = () => API_BASE_URL;