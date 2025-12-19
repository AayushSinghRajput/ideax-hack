import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

/* ---------------------------
   CROPS (Products)
---------------------------- */
export const fetchCrops = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/products/product-name`);
    return res.data; // expects [{ _id, productName }]
  } catch (err) {
    console.error("Fetch crops error:", err.response?.data || err.message);
    throw new Error("Failed to fetch crops");
  }
};

/* ---------------------------
   TOOLS (Machines)
---------------------------- */
export const fetchTools = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/machines/machine-name`);
    return res.data; // expects [{ _id, toolName }]
  } catch (err) {
    console.error("Fetch tools error:", err.response?.data || err.message);
    throw new Error("Failed to fetch tools");
  }
};

/* ---------------------------
   FARMERS (Users with role=farmer)
---------------------------- */
export const fetchFarmers = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/auth/farmer-name`);
    return res.data; // expects [{ _id, name }]
  } catch (err) {
    console.error("Fetch farmers error:", err.response?.data || err.message);
    throw new Error("Failed to fetch farmers");
  }
};

/* ---------------------------
   CREATE PREBOOKING
---------------------------- */
export const createPrebooking = async (data) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/prebooking/create`, data);
    return res.data;
  } catch (err) {
    console.error("Create prebooking error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || "Failed to create prebooking");
  }
};
