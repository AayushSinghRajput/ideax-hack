import Constants from "expo-constants";

/* ===============================
   API KEY HANDLING (RAPID API)
================================ */
const getRapidApiKey = () => {
  try {
    const apiKey =
      Constants.expoConfig?.extra?.RAPIDAPI_KEY ||
      Constants.manifest?.extra?.RAPIDAPI_KEY ||
      process.env.RAPIDAPI_KEY;

    if (!apiKey) {
      throw new Error("RapidAPI key not found");
    }

    return apiKey;
  } catch (error) {
    console.error("API Key Error:", error);
    throw new Error("Failed to retrieve RapidAPI key.");
  }
};

const RAPIDAPI_KEY = getRapidApiKey();
const RAPIDAPI_HOST = "open-weather13.p.rapidapi.com";

/* ===============================
   HELPERS
================================ */
const kelvinToCelsius = (k) =>
  typeof k === "number" ? +(k - 273.15).toFixed(1) : null;

/* ===============================
   FALLBACK DATA
================================ */
const fallbackWeather = {
  temperature: 25,
  humidity: 50,
  rainfall: 0,
  condition: "clear sky",
  icon: "01d",
};

const fallbackForecast = [
  {
    dt_txt: new Date().toISOString(),
    main: { temp: 25, humidity: 50 },
    weather: [{ description: "clear sky", icon: "01d" }],
    rain: { "3h": 0 },
  },
];

/* ===============================
   CURRENT WEATHER
================================ */
export const getWeather = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude)
      throw new Error("Latitude and longitude are required.");

    const url = `https://${RAPIDAPI_HOST}/fivedaysforcast?latitude=${latitude}&longitude=${longitude}&lang=EN`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    if (!res.ok) throw new Error(`Weather API Error: ${res.statusText}`);

    const data = await res.json();
    const current = data.list?.[0];

    if (!current) throw new Error("No current weather data found");

    return {
      temperature:
        kelvinToCelsius(current.main?.temp) ??
        fallbackWeather.temperature,

      humidity:
        current.main?.humidity ??
        fallbackWeather.humidity,

      rainfall:
        current.rain?.["3h"] ??
        fallbackWeather.rainfall,

      condition:
        current.weather?.[0]?.description ??
        fallbackWeather.condition,

      icon:
        current.weather?.[0]?.icon ??
        fallbackWeather.icon,
    };
  } catch (err) {
    console.error("Fetch Weather Error, using fallback:", err);
    return fallbackWeather;
  }
};

/* ===============================
   WEATHER FORECAST (5 DAYS)
================================ */
export const getWeatherForecast = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude)
      throw new Error("Latitude and longitude are required.");

    const url = `https://${RAPIDAPI_HOST}/fivedaysforcast?latitude=${latitude}&longitude=${longitude}&lang=EN`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    });

    if (!res.ok)
      throw new Error(`Forecast API Error: ${res.statusText}`);

    const data = await res.json();

    return (
      data.list?.map((item) => ({
        ...item,
        main: {
          ...item.main,
          temp: kelvinToCelsius(item.main?.temp),
          feels_like: kelvinToCelsius(item.main?.feels_like),
          temp_min: kelvinToCelsius(item.main?.temp_min),
          temp_max: kelvinToCelsius(item.main?.temp_max),
        },
      })) ?? fallbackForecast
    );
  } catch (err) {
    console.error("Fetch Forecast Error, using fallback:", err);
    return fallbackForecast;
  }
};
