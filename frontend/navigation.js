(function initializeJanSevakNavigation() {
  function getTranslations() {
    const language = window.JanSevakSession?.getLanguage?.() || "en";
    return window.JANSEVAK_TRANSLATIONS?.[language] || window.JANSEVAK_TRANSLATIONS?.en || {};
  }

  function goHome() {
    window.location.href = "/index.html";
  }

  function goBack() {
    window.history.back();
  }

  function buildNavButton(label, onClick, extraClass = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white ${extraClass}`.trim();
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderPageNavigation(containerId, options = {}) {
    const {
      showProfile = true,
      showSession = true
    } = options;
    const translations = getTranslations();
    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className =
      "mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6";

    const leftGroup = document.createElement("div");
    leftGroup.className = "flex flex-wrap items-center gap-3";
    leftGroup.append(
      buildNavButton(`🏠 ${translations.home || "Home"}`, goHome),
      buildNavButton(`⬅ ${translations.back || "Back"}`, goBack)
    );

    if (showProfile && window.JanSevakSession?.hasAuthToken()) {
      leftGroup.append(buildNavButton(`👤 ${translations.profile || "Profile"}`, () => {
        window.location.href = "/profile.html";
      }));
    }

    const rightGroup = document.createElement("div");
    rightGroup.className = "flex flex-wrap items-center gap-3";

    if (showSession) {
      const sessionContainer = document.createElement("div");
      sessionContainer.id = `${containerId}-session`;
      rightGroup.appendChild(sessionContainer);
      window.JanSevakSession?.renderSessionControls(sessionContainer.id);
    }

    wrapper.append(leftGroup, rightGroup);
    container.appendChild(wrapper);
  }

  window.goHome = goHome;
  window.goBack = goBack;
  window.JanSevakNavigation = {
    goBack,
    goHome,
    renderPageNavigation
  };
})();
