import voiceRecordingService from "./voiceRecordingService";
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.FASTAPI_BASE_URL;

class ProductSearchService {
  // Search products by text
  async searchByText(searchText) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/search?query=${encodeURIComponent(searchText)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("Search error:", error);
      return { success: false, error: error.message, results: [] };
    }
  }

  // Search products by voice
  async searchByVoice(voiceRecording) {
    try {
      const formData = new FormData();

      // Add voice recording
      if (voiceRecording.base64) {
        // Convert base64 to blob for FormData
        const blob = await this.base64ToBlob(
          voiceRecording.base64,
          "audio/mp3"
        );

        formData.append("audio", blob, voiceRecording.filename);
      } else if (voiceRecording.uri) {
        // If we have URI, use it directly
        const audioFile = {
          uri: voiceRecording.uri,
          type: "audio/mp3",
          name: voiceRecording.filename,
        };
        formData.append("audio", audioFile);
      }

      // Add any additional data
      formData.append("language", "ne"); // Nepali
      formData.append("type", "product_search");

      const response = await fetch(`${API_BASE_URL}/voice-search`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // Process response - backend should return detected product name
      // Example response: { detected_text: "chamal", products: [...] }
      return {
        success: true,
        detectedText: data.detected_text || "",
        products: data.products || [],
        rawResponse: data,
      };
    } catch (error) {
      console.error("Voice search error:", error);
      return {
        success: false,
        error: error.message,
        detectedText: "",
        products: [],
      };
    }
  }

  // Helper: Convert base64 to blob
  async base64ToBlob(base64, contentType = "audio/mp3") {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  // Combined search function
  async search(query, isVoice = false) {
    if (isVoice) {
      return await this.searchByVoice(query);
    } else {
      return await this.searchByText(query);
    }
  }
}

export default new ProductSearchService();
