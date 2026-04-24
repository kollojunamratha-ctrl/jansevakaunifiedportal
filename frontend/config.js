(function initializeJanSevakConfig() {
  const DEFAULT_BACKEND_URL = "https://your-backend-url.onrender.com";
  const DEFAULT_FRONTEND_URL = "https://your-frontend-url.vercel.app";

  function trimTrailingSlash(value) {
    return String(value || "").replace(/\/+$/, "");
  }

  function getConfiguredBackendUrl() {
    if (typeof window.JANSEVAK_BACKEND_URL === "string" && window.JANSEVAK_BACKEND_URL.trim()) {
      return trimTrailingSlash(window.JANSEVAK_BACKEND_URL);
    }

    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000";
    }

    return DEFAULT_BACKEND_URL;
  }

  function buildApiUrl(pathname) {
    if (!pathname) {
      return getConfiguredBackendUrl();
    }

    if (/^https?:\/\//i.test(pathname)) {
      return pathname;
    }

    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${getConfiguredBackendUrl()}${normalizedPath}`;
  }

  window.JanSevakConfig = {
    apiBaseUrl: getConfiguredBackendUrl(),
    buildApiUrl,
    defaultBackendUrl: DEFAULT_BACKEND_URL,
    defaultFrontendUrl: DEFAULT_FRONTEND_URL
  };
})();
