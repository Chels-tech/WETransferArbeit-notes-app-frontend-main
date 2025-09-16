// src/config.js
const BASE_URL = import.meta.env.VITE_API_URL + "/api";

export const API = {
  notes: `${BASE_URL}/notes`,
  auth: `${BASE_URL}/auth`,
};
