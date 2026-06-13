import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

export const API_ORIGIN = API_BASE_URL.startsWith("http")
  ? API_BASE_URL.replace(/\/api\/?$/, "")
  : window.location.origin;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function toMediaUrl(assetPath) {
  if (!assetPath) {
    return "";
  }

  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  return `${API_ORIGIN}${assetPath}`;
}

export default api;
