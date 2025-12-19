import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;


export const fetchAgriNews = async (language = "EN") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news`, {
      params: { lang: language },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch news:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
