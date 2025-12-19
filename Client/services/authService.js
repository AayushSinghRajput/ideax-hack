import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

// Login API
export const loginUser = async (email, password) => {
  const API_URL = __DEV__
    ? `${API_BASE_URL}/auth/login`
    : `${API_BASE_URL}/auth/login`;

  try {
    const response = await axios.post(
      API_URL,
      { email: email.toLowerCase().trim(), password },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return { status: response.status, data: response.data };
  } catch (error) {
    // Axios errors have a response object for server errors
    if (error.response) {
      return { status: error.response.status, data: error.response.data };
    } else {
      // Network or other errors
      throw error;
    }
  }
};

// Register API
export const registerUser = async (formData) => {
  const API_URL = __DEV__
    ? `${API_BASE_URL}/auth/register`
    : `${API_BASE_URL}/auth/register`;

  const requestBody = {
    name: formData.name.trim(),
    email: formData.email.toLowerCase().trim(),
    password: formData.password,
    phone: formData.phone.trim(),
    role: formData.role,
  };

  try {
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return { status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      return { status: error.response.status, data: error.response.data };
    } else {
      throw error;
    }
  }
};
