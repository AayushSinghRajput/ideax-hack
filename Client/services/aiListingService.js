// services/aiListingService.js (SIMPLIFIED WORKING VERSION)
import { Platform } from "react-native";

// DIRECT URL - No complexity
const API_BASE_URL = "http://10.10.255.24:8000";
console.log("🎯 API URL:", API_BASE_URL);
console.log("📱 Platform:", Platform.OS);

// Simple fetch without AbortController (causes issues on React Native)
const simpleFetch = async (url, options = {}) => {
  return fetch(url, options);
};

export const testConnection = async () => {
  try {
    console.log("Testing connection to:", API_BASE_URL);
    
    const response = await simpleFetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Connection successful:", data);
      return {
        success: true,
        message: `Connected to ${API_BASE_URL}`,
        data: data
      };
    } else {
      const errorText = await response.text();
      console.log("❌ Server error:", response.status, errorText);
      return {
        success: false,
        message: `Server error: ${response.status}`,
        error: errorText
      };
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
    
    return {
      success: false,
      message: `Cannot connect to ${API_BASE_URL}`,
      error: error.message,
      help: `FIREWALL ISSUE! Please:\n1. Disable Windows Firewall\n2. Ensure FastAPI running: uvicorn app.main:app --host 0.0.0.0 --port 8000\n3. Test in phone browser: ${API_BASE_URL}`
    };
  }
};

export const askQuestion = async () => {
  try {
    console.log("GET request to:", `${API_BASE_URL}/next?session_id=1`);
    
    const response = await simpleFetch(`${API_BASE_URL}/next?session_id=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("✅ Response:", data);
    return data;
    
  } catch (error) {
    console.error("askQuestion error:", error);
    
    return {
      question: `🔴 CONNECTION ERROR\n\n` +
                `Cannot connect to:\n${API_BASE_URL}\n\n` +
                `Error: ${error.message}\n\n` +
                `🔧 IMMEDIATE FIX:\n` +
                `1. Open Command Prompt as ADMIN\n` +
                `2. Run: netsh advfirewall set allprofiles state off\n` +
                `3. Restart FastAPI\n` +
                `4. Test: ${API_BASE_URL} in phone browser`
    };
  }
};

export const sendAnswer = async (answerText = null, voiceUri = null) => {
  try {
    console.log("POST request to:", `${API_BASE_URL}/next`);
    
    const formData = new FormData();
    formData.append('session_id', '1');
    
    if (answerText) {
      formData.append('text', answerText);
      console.log("Text:", answerText);
    }
    
    if (voiceUri) {
      const filename = voiceUri.split('/').pop() || 'audio.mp3';
      const audioFile = {
        uri: voiceUri,
        type: 'audio/mp3',
        name: filename,
      };
      formData.append('audio', audioFile);
      console.log("Audio file:", filename);
    }
    
    const response = await simpleFetch(`${API_BASE_URL}/next`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("✅ Response:", data);
    return data;
    
  } catch (error) {
    console.error("sendAnswer error:", error);
    
    return {
      done: false,
      question: `Error: ${error.message}`,
      machineData: null
    };
  }
};

// Export URL for debugging
export const getApiUrl = () => API_BASE_URL;