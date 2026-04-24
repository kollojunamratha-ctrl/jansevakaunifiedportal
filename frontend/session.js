(function initializeJanSevakSession() {
  const LANGUAGE_STORAGE_KEY = "language";
  const TOKEN_STORAGE_KEY = "token";
  const LEGACY_TOKEN_STORAGE_KEY = "jansevak-token";
  const USER_STORAGE_KEY = "jansevak-user";

  function migrateLegacyToken() {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);

    if (!token && legacyToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken);
      localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      return legacyToken;
    }

    return token;
  }

  function getToken() {
    return migrateLegacyToken() || localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  function getAuthHeaders(extraHeaders = {}) {
    const token = getToken();

    return {
      ...extraHeaders,
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {})
    };
  }

  function hasAuthToken() {
    return Boolean(getToken());
  }

  function getLanguage() {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
  }

  function setLanguage(language) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

  function getSession() {
    const token = getToken();
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!token || !rawUser) {
      return { token: null, user: null };
    }

    try {
      return {
        token,
        user: JSON.parse(rawUser)
      };
    } catch {
      clearSession();
      return { token: null, user: null };
    }
  }

  function storeSession(payload) {
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
  }

  function updateSessionUser(updates) {
    const session = getSession();

    if (!session.user) {
      return;
    }

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({
        ...session.user,
        ...updates
      })
    );
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  function requireAuth(redirectTo = "/login.html") {
    if (!hasAuthToken()) {
      window.location.replace(redirectTo);
      return false;
    }

    return true;
  }

  function redirectIfAuthenticated(destination = "/index.html") {
    if (hasAuthToken()) {
      window.location.replace(destination);
      return true;
    }

    return false;
  }

  function hydrateLanguageSelect(selectId, onChange) {
    const select = document.getElementById(selectId);

    if (!select) {
      return;
    }

    select.value = getLanguage();
    select.addEventListener("change", (event) => {
      setLanguage(event.target.value);
      if (typeof onChange === "function") {
        onChange(event.target.value);
      }
    });
  }

  function renderSessionControls(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    const session = getSession();

    if (session.token && session.user) {
      container.innerHTML = `
        <div class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
          <span class="font-semibold">${session.user.phone}</span>
          <button id="logoutButton" type="button" class="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-accent hover:text-white">
            Logout
          </button>
        </div>
      `;

      const logoutButton = document.getElementById("logoutButton");
      logoutButton?.addEventListener("click", () => {
        clearSession();
        window.location.href = "/login.html";
      });
      return;
    }

    container.innerHTML = `
      <div class="flex items-center gap-2">
        <a href="/login.html" class="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-accent hover:text-white">Login</a>
        <a href="/signup.html" class="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110">Sign Up</a>
      </div>
    `;
  }

  window.JanSevakSession = {
    clearSession,
    getAuthHeaders,
    getLanguage,
    getSession,
    getToken,
    hasAuthToken,
    hydrateLanguageSelect,
    redirectIfAuthenticated,
    renderSessionControls,
    requireAuth,
    setLanguage,
    storeSession,
    updateSessionUser
  };
})();
