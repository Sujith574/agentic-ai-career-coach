const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const AUTH_KEY = "career_os_auth";

const DEFAULT_TIMEOUT_MS = 20000;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function apiRequest(path, options = {}, config = {}) {
  const retries = config.retries ?? 1;
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const authRaw = localStorage.getItem(AUTH_KEY);
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const mergedHeaders = {
        ...(options.headers || {}),
      };
      if (auth?.accessToken) {
        mergedHeaders.Authorization = `Bearer ${auth.accessToken}`;
      }
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 401 && !path.includes("/auth/login")) {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = "/login";
        throw new Error("Unauthorized. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < retries) {
        await delay(350 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("API request failed");
}

