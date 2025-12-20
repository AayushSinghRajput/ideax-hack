import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

class VoiceTranscriptionService {
  /**
   * Send audio file to backend for transcription
   * @param {Object} audioFile - Audio file object with uri, name, type
   * @returns {Promise} - Transcription result
   */
  static async transcribeAudio(audioFile) {
    try {
      console.log("Starting transcription for:", {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size
      });

      if (!audioFile || !audioFile.uri) {
        throw new Error("No audio file provided");
      }

      // Create FormData
      const formData = new FormData();
      
      // Append the file - React Native expects this format
      formData.append('audio', {
        uri: audioFile.uri,
        type: audioFile.type || 'audio/mp4',
        name: audioFile.name || 'recording.mp4',
      });

      // IMPORTANT: Use 'en' for language (Groq only supports English for translation)
      // Even if user speaks Nepali, Whisper can transcribe it but output will be in English
      formData.append('language', 'en'); // Changed from 'ne' to 'en'
      
      // Update prompt to work with English output
      formData.append('prompt', 'Agricultural crop names: rice, tomato, potato, onion, carrot, banana, apple, corn, wheat, barley, spinach');
      
      // Add temperature parameter
      formData.append('temperature', '0.0');

      console.log("Sending request to:", `${API_BASE_URL}/audio/transcribe`);

      // Send request to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/api/audio/transcribe`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);

      // Check response status
      if (!response.ok) {
        let errorText = "Server error";
        try {
          errorText = await response.text();
        } catch (e) {
          console.warn("Could not read error response text");
        }
        console.error("Server error details:", {
          status: response.status,
          errorText: errorText.substring(0, 200)
        });
        throw new Error(`Server error: ${response.status}`);
      }

      // Parse response
      const result = await response.json();
      console.log("Transcription result received:", {
        success: result.success,
        text: result.data?.text,
        language: result.data?.language,
        textLength: result.data?.text?.length
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Transcription failed');
      }

      // Clean and process the text
      const cleanedText = this.cleanTranscriptionText(result.data?.text || "");
      
      return {
        success: true,
        text: cleanedText,
        language: result.data?.language || "en",
        model: result.data?.model || "unknown",
        rawText: result.data?.text || "",
        originalResponse: result.data,
      };

    } catch (error) {
      console.error('Transcription API error:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 300)
      });
      
      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      return {
        success: false,
        error: errorMessage,
        text: null,
      };
    }
  }

  /**
   * Clean and normalize transcription text
   * @param {String} text - Raw transcription text
   * @returns {String} - Cleaned text
   */
  static cleanTranscriptionText(text) {
    if (!text) return "";
    
    // Trim whitespace
    let cleaned = text.trim();
    
    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Convert to lowercase for easier processing
    cleaned = cleaned.toLowerCase();
    
    // Remove common filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'i mean'];
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Clean up multiple spaces again
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    console.log("Cleaned transcription:", cleaned);
    return cleaned;
  }

  /**
   * Enhanced crop name extraction (now works with English output)
   * @param {String} text - Transcription text
   * @returns {Array} - List of crop names found
   */
  static extractCropNames(text) {
    if (!text || typeof text !== 'string') return [];

    const cleanedText = text.toLowerCase();
    const foundCrops = [];

    // English crop names with variations
    const englishCropMap = {
      // Grains
      'rice': 'rice',
      'wheat': 'wheat',
      'corn': 'corn',
      'maize': 'corn',
      'barley': 'barley',
      'millet': 'millet',
      'buckwheat': 'buckwheat',
      'paddy': 'rice',
      
      // Vegetables
      'tomato': 'tomato',
      'tomatoes': 'tomato',
      'potato': 'potato',
      'potatoes': 'potato',
      'onion': 'onion',
      'onions': 'onion',
      'carrot': 'carrot',
      'carrots': 'carrot',
      'spinach': 'spinach',
      'cucumber': 'cucumber',
      'cucumbers': 'cucumber',
      'okra': 'okra',
      'radish': 'radish',
      'radishes': 'radish',
      'gourd': 'gourd',
      'bitter gourd': 'bitter gourd',
      'bottle gourd': 'bottle gourd',
      'cauliflower': 'cauliflower',
      'cabbage': 'cabbage',
      'broccoli': 'broccoli',
      'garlic': 'garlic',
      'ginger': 'ginger',
      
      // Fruits
      'banana': 'banana',
      'bananas': 'banana',
      'apple': 'apple',
      'apples': 'apple',
      'mango': 'mango',
      'mangoes': 'mango',
      'orange': 'orange',
      'oranges': 'orange',
      'lemon': 'lemon',
      'lemons': 'lemon',
      'lime': 'lime',
      'limes': 'lime',
      'grape': 'grape',
      'grapes': 'grape',
      'pear': 'pear',
      'pears': 'pear',
      'pomegranate': 'pomegranate',
      'lychee': 'lychee',
      'gooseberry': 'gooseberry',
      
      // Spices and others
      'turmeric': 'turmeric',
      'chili': 'chili',
      'chilies': 'chili',
      'pepper': 'pepper',
      'cumin': 'cumin',
      'coriander': 'coriander',
      'fenugreek': 'fenugreek',
      
      // Categories
      'vegetable': 'vegetables',
      'vegetables': 'vegetables',
      'fruit': 'fruits',
      'fruits': 'fruits',
      'grain': 'grains',
      'grains': 'grains',
      'spice': 'spices',
      'spices': 'spices',
    };

    // Check for English crop names with word boundaries
    Object.keys(englishCropMap).forEach(englishName => {
      // Use word boundaries for more accurate matching
      const regex = new RegExp(`\\b${englishName}\\b`, 'i');
      if (regex.test(cleanedText)) {
        const englishTerm = englishCropMap[englishName];
        if (!foundCrops.some(crop => crop.english === englishTerm)) {
          foundCrops.push({
            nepali: this.getNepaliEquivalent(englishTerm),
            english: englishTerm,
            confidence: 'high'
          });
        }
      }
    });

    // Also check for partial matches (without word boundaries)
    if (foundCrops.length === 0) {
      const allCrops = Object.keys(englishCropMap);
      for (const crop of allCrops) {
        if (cleanedText.includes(crop.toLowerCase())) {
          const englishTerm = englishCropMap[crop];
          if (englishTerm && !foundCrops.some(fc => fc.english === englishTerm)) {
            foundCrops.push({
              nepali: this.getNepaliEquivalent(englishTerm),
              english: englishTerm,
              confidence: 'medium'
            });
          }
        }
      }
    }

    console.log("Extracted crops:", foundCrops);
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
      'vegetables': 'तरकारी',
      'fruits': 'फलफूल',
      'grains': 'अन्न',
      'mango': 'आँप',
      'orange': 'सुन्तला',
      'cucumber': 'काँक्रो',
      'radish': 'मूली',
      'garlic': 'लसुन',
      'ginger': 'अदुवा',
      'turmeric': 'हल्दी',
      'chili': 'मरिच',
      'cumin': 'जिरा',
      'coriander': 'धनिया',
      'millet': 'कोदो',
      'buckwheat': 'फापर',
      'gourd': 'लौका',
      'bitter gourd': 'करेला',
      'bottle gourd': 'लौका',
      'cauliflower': 'फूलकापी',
      'cabbage': 'बन्दगोभी',
      'broccoli': 'ब्रोकोली',
      'lemon': 'निबुवा',
      'lime': 'कागती',
      'grape': 'अंगुर',
      'pear': 'नास्पाती',
      'pomegranate': 'अनार',
      'lychee': 'लिची',
      'gooseberry': 'अमला',
      'fenugreek': 'मेथी',
      'spices': 'मसला',
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

    console.log("Converting to search term:", text);
    
    // Clean the text first
    const cleanedText = this.cleanTranscriptionText(text);
    
    // Try to extract crop names
    const crops = this.extractCropNames(cleanedText);
    
    if (crops.length > 0) {
      // Prioritize high confidence matches
      const highConfidenceCrops = crops.filter(crop => crop.confidence === 'high');
      const selectedCrop = highConfidenceCrops.length > 0 ? highConfidenceCrops[0] : crops[0];
      
      console.log("Selected crop for search:", selectedCrop);
      return selectedCrop.english;
    }

    // Fallback: Try to find common English crop names
    const commonCrops = ['tomato', 'potato', 'onion', 'carrot', 'rice', 'banana', 'apple', 'corn', 'wheat'];
    for (const crop of commonCrops) {
      if (cleanedText.includes(crop)) {
        console.log("Found common crop in text:", crop);
        return crop;
      }
    }

    // Last resort: Use the first meaningful word
    const words = cleanedText.split(' ').filter(word => word.length > 2);
    if (words.length > 0) {
      console.log("Using first meaningful word:", words[0]);
      return words[0];
    }

    console.log("Using cleaned text as search term:", cleanedText);
    return cleanedText;
  }

  /**
   * Check if audio transcription service is available
   * @returns {Promise} - Health check result
   */
  static async checkHealth() {
    try {
      console.log("Checking health at:", `${API_BASE_URL}/api/audio/health`);
      
      const response = await fetch(`${API_BASE_URL}/api/audio/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log("Health check response status:", response.status);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Health check result:", result);
      
      return {
        success: true,
        message: result.message || "Audio service is running",
        timestamp: result.timestamp,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        error: error.message || 'Service unavailable',
      };
    }
  }
}

export default VoiceTranscriptionService;