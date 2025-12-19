import Constants from "expo-constants";

const getApiKey = () => {
  try {
    const apiKey =
      Constants.expoConfig?.extra?.OPENWEATHER_API_KEY ||
      Constants.manifest?.extra?.OPENWEATHER_API_KEY ||
      process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error("OpenWeather API key not found");
    }

    return apiKey;
  } catch (error) {
    console.error("API Key Error:", error);
    throw new Error("Failed to retrieve OpenWeather API key.");
  }
};

const OPENWEATHER_API_KEY = getApiKey();

// Default fallback data
const fallbackWeather = {
  temperature: 25, // default temperature in Celsius
  humidity: 50, // default humidity
  rainfall: 0, // default rainfall
  condition: "clear sky", // default weather description
  icon: "01d", // default weather icon
};

const fallbackForecast = [
  {
    dt_txt: new Date().toISOString(),
    main: { temp: 25, humidity: 50 },
    weather: [{ description: "clear sky", icon: "01d" }],
    rain: { "1h": 0 },
  },
  // you can add more default forecast entries if needed
];

export const getWeather = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude)
      throw new Error("Latitude and longitude are required.");

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!res.ok) throw new Error(`Weather API Error: ${res.statusText}`);

    const data = await res.json();

    return {
      temperature: data.main?.temp ?? fallbackWeather.temperature,
      humidity: data.main?.humidity ?? fallbackWeather.humidity,
      rainfall: data.rain?.["1h"] ?? fallbackWeather.rainfall,
      condition: data.weather?.[0]?.description ?? fallbackWeather.condition,
      icon: data.weather?.[0]?.icon ?? fallbackWeather.icon,
    };
  } catch (err) {
    console.error("Fetch Weather Error, using fallback:", err);
    return fallbackWeather;
  }
};

export const getWeatherForecast = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude)
      throw new Error("Latitude and longitude are required.");

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!res.ok) throw new Error(`Forecast API Error: ${res.statusText}`);

    const data = await res.json();
    return data.list ?? fallbackForecast;
  } catch (err) {
    console.error("Fetch Forecast Error, using fallback:", err);
    return fallbackForecast;
  }
};
