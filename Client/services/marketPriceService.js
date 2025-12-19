import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export const fetchTodayMarketPrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/prices/today`);

    if (!response.ok) {
      throw new Error("Failed to fetch market prices");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error fetching market prices:", error.message);
    throw new Error(error.message || "Something went wrong");
  }
};