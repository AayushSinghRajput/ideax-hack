import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || "http://10.10.255.24:5000/api";

class VoiceTranscriptionService {
  /**
   * Send audio file to backend for transcription
   * @param {Object} audioFile - Audio file object with uri, name, type
   * @returns {Promise} - Transcription result
   */
  static async transcribeAudio(audioFile) {
    try {
      console.log("Starting transcription for:", audioFile);

      if (!audioFile || !audioFile.uri) {
        throw new Error("No audio file provided");
      }

      // Create FormData
      const formData = new FormData();
      
      // Append the file - React Native expects this format
      formData.append('audio', {
        uri: audioFile.uri,
        type: audioFile.type || 'audio/m4a',
        name: audioFile.name || 'recording.m4a',
      });

      // Optional: Add language parameter (Nepali)
      formData.append('language', 'ne'); // 'ne' for Nepali
      
      // Optional: Add prompt for better accuracy
      formData.append('prompt', 'Crop names in Nepali: चामल, टमाटर, आलु, प्याज, गाजर, केरा');

      console.log("Sending request to:", `${API_BASE_URL}/audio/transcribe`);

      // Send request to backend
      const response = await fetch(`${API_BASE_URL}/audio/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Response status:", response.status);

      // Check response status
      if (!response.ok) {
        let errorText = "Server error";
        try {
          errorText = await response.text();
        } catch (e) {
          // Ignore text parsing error
        }
        console.error("Server error:", response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`);
      }

      // Parse response
      const result = await response.json();
      console.log("Transcription result:", result);
      
      if (!result.success) {
        throw new Error(result.message || 'Transcription failed');
      }

      return {
        success: true,
        text: result.data?.text || "",
        language: result.data?.language || "en",
        model: result.data?.model || "unknown",
        rawText: result.data?.text || "",
      };

    } catch (error) {
      console.error('Transcription API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to transcribe audio',
        text: null,
      };
    }
  }



  /**
   * Extract crop names from transcription text
   * @param {String} text - Transcription text
   * @returns {Array} - List of crop names found
   */
  static extractCropNames(text) {
    if (!text || typeof text !== 'string') return [];

    const textLower = text.toLowerCase();
    const foundCrops = [];

    // Nepali crop names mapping
    const nepaliCropMap = {
      'चामल': 'rice',
      'भात': 'rice',
      'टमाटर': 'tomato',
      'आलु': 'potato',
      'प्याज': 'onion',
      'गाजर': 'carrot',
      'साग': 'spinach',
      'केरा': 'banana',
      'सुँगुर': 'apple',
      'जु': 'corn',
      'गहु': 'wheat',
      'यव': 'barley',
      'मकै': 'corn',
      'तरकारी': 'vegetables',
      'फलफूल': 'fruits',
      'अन्न': 'grains',
    };

    // Check for Nepali crop names
    Object.keys(nepaliCropMap).forEach(nepaliName => {
      if (textLower.includes(nepaliName.toLowerCase())) {
        foundCrops.push({
          nepali: nepaliName,
          english: nepaliCropMap[nepaliName]
        });
      }
    });

    // English crop names
    const englishCrops = [
      'rice', 'tomato', 'potato', 'onion', 'carrot', 'spinach',
      'banana', 'apple', 'corn', 'wheat', 'barley', 'vegetable',
      'fruit', 'grain', 'vegetables', 'fruits', 'grains'
    ];

    englishCrops.forEach(englishName => {
      if (textLower.includes(englishName.toLowerCase())) {
        // Check if not already added as Nepali equivalent
        if (!foundCrops.some(crop => crop.english === englishName)) {
          foundCrops.push({
            nepali: this.getNepaliEquivalent(englishName),
            english: englishName
          });
        }
      }
    });

    return foundCrops;
  }

  /**
   * Get Nepali equivalent for English crop name
   * @param {String} englishName - English crop name
   * @returns {String} - Nepali equivalent
   */
  static getNepaliEquivalent(englishName) {
    const nepaliMap = {
      'rice': 'चामल',
      'tomato': 'टमाटर',
      'potato': 'आलु',
      'onion': 'प्याज',
      'carrot': 'गाजर',
      'spinach': 'साग',
      'banana': 'केरा',
      'apple': 'सुँगुर',
      'corn': 'मकै',
      'wheat': 'गहु',
      'barley': 'यव',
      'vegetable': 'तरकारी',
      'vegetables': 'तरकारी',
      'fruit': 'फल',
      'fruits': 'फलफूल',
      'grain': 'अन्न',
      'grains': 'अन्न',
    };
    
    return nepaliMap[englishName.toLowerCase()] || englishName;
  }

  /**
   * Convert transcription to search term
   * @param {String} text - Transcription text
   * @returns {String} - Search term
   */
  static convertToSearchTerm(text) {
    if (!text) return "";

    // First, try to extract crop names
    const crops = this.extractCropNames(text);
    
    if (crops.length > 0) {
      // Use the first crop's English name
      return crops[0].english;
    }

    // Fallback: Use the original text
    return text.toLowerCase().trim();
  }
}

export default VoiceTranscriptionService;