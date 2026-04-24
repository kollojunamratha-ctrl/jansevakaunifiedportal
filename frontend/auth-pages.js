async function submitJson(url, payload) {
  const response = await fetch(window.JanSevakConfig.buildApiUrl(url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.details || "Request failed");
  }

  return data;
}

function setStatus(message, isError = false) {
  const status = document.getElementById("formStatus");

  if (!status) {
    return;
  }

  status.textContent = message;
  status.className = `rounded-2xl border px-4 py-3 text-sm ${
    isError
      ? "border-red-500/30 bg-red-500/10 text-red-100"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
  }`;
}

function bindSignupForm() {
  const form = document.getElementById("signupForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Creating your account...");

    try {
      const payload = await submitJson("/api/signup", {
        phone: form.phone.value,
        password: form.password.value
      });

      window.JanSevakSession.storeSession(payload);
      setStatus("Account created successfully.");
      window.location.href = "/index.html";
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

function bindLoginForm() {
  const form = document.getElementById("loginForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Logging you in...");

    try {
      const payload = await submitJson("/api/login", {
        phone: form.phone.value,
        password: form.password.value
      });

      window.JanSevakSession.storeSession(payload);
      setStatus("Login successful.");
      window.location.href = "/index.html";
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

function bindForgotPasswordForm() {
  const form = document.getElementById("forgotPasswordForm");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Updating your password...");

    try {
      await submitJson("/api/forgot-password", {
        phone: form.phone.value,
        newPassword: form.newPassword.value
      });

      setStatus("Password updated. Redirecting to login...");
      window.setTimeout(() => {
        window.location.href = "/login.html";
      }, 1200);
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

function initializeAuthPages() {
  if (window.JanSevakSession.redirectIfAuthenticated()) {
    return;
  }

  window.JanSevakNavigation?.renderPageNavigation("pageNav", {
    showProfile: false,
    showSession: false
  });
  window.JanSevakSession.hydrateLanguageSelect("languageSelect");
  window.JanSevakSession.renderSessionControls("sessionControls");
  bindSignupForm();
  bindLoginForm();
  bindForgotPasswordForm();
}

initializeAuthPages();
