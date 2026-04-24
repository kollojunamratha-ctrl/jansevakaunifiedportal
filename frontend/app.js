function getTranslations() {
  const language = window.JanSevakSession.getLanguage();
  return window.JANSEVAK_TRANSLATIONS?.[language] || window.JANSEVAK_TRANSLATIONS?.en || {};
}

function getStateLabel(state) {
  const translations = getTranslations();
  return translations.stateNames?.[state] || state;
}

function getCategoryLabel(category) {
  const translations = getTranslations();
  return translations.homeCategoryLabels?.[category] || category;
}

function openState(state) {
  window.location.href = `/schemes.html?state=${encodeURIComponent(state)}`;
}

function openCategory(category) {
  window.location.href = `/schemes.html?category=${encodeURIComponent(category)}`;
}

function openSearch() {
  const input = document.getElementById("homeSearchInput");
  const query = input?.value.trim() || "";
  const params = new URLSearchParams();

  if (query) {
    params.set("search", query);
  }

  const suffix = params.toString();
  window.location.href = suffix ? `/schemes.html?${suffix}` : "/schemes.html";
}

function applyHomepageTranslations() {
  const translations = getTranslations();

  document.getElementById("appTitle").textContent = translations.appTitle || "JanSevak";
  document.getElementById("categoryHeading").textContent =
    translations.browseByCategory || "Browse by Category";
  document.getElementById("stateHeading").textContent =
    translations.selectState || "Select Your State";
  document.getElementById("homeSearchInput").placeholder =
    translations.searchPlaceholder || "Search government schemes...";
  document.getElementById("viewAllStatesButton").textContent =
    translations.viewAll || "View All";

  document.querySelectorAll("[data-state]").forEach((button) => {
    const state = button.getAttribute("data-state");
    button.textContent = getStateLabel(state);
  });

  document.querySelectorAll("[data-category]").forEach((button) => {
    const category = button.getAttribute("data-category");
    const label = button.querySelector(".category-label");
    if (label) {
      label.textContent = getCategoryLabel(category);
    }
  });

  document.querySelectorAll("[data-category-search]").forEach((button) => {
    const categoryKey = button.getAttribute("data-category-search");
    const normalizedKey = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
    const label = button.querySelector(".category-label");
    if (label) {
      label.textContent = getCategoryLabel(normalizedKey);
    }
  });
}

function initializeHomepage() {
  if (!window.JanSevakSession.requireAuth()) {
    return;
  }

  window.JanSevakNavigation?.renderPageNavigation("pageNav", {
    showProfile: true,
    showSession: false
  });
  applyHomepageTranslations();

  window.JanSevakSession.hydrateLanguageSelect("languageSelect", () => {
    window.JanSevakNavigation?.renderPageNavigation("pageNav", {
      showProfile: true,
      showSession: false
    });
    applyHomepageTranslations();
    updateProfileShortcut();
  });

  document.querySelectorAll("[data-state]").forEach((button) => {
    button.addEventListener("click", () => {
      openState(button.getAttribute("data-state"));
    });
  });

  document.getElementById("viewAllStatesButton")?.addEventListener("click", () => {
    window.location.href = "/schemes.html";
  });

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      openCategory(button.getAttribute("data-category"));
    });
  });

  document.querySelectorAll("[data-category-search]").forEach((button) => {
    button.addEventListener("click", () => {
      const query = button.getAttribute("data-category-search");
      window.location.href = `/schemes.html?search=${encodeURIComponent(query)}`;
    });
  });

  document.getElementById("homeSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    openSearch();
  });

  document.getElementById("homeSearchMic")?.addEventListener("click", () => {
    openSearch();
  });

  document.getElementById("profileShortcut")?.addEventListener("click", () => {
    window.location.href = "/profile.html";
  });
  updateProfileShortcut();
}

window.openState = openState;
window.openCategory = openCategory;

function updateProfileShortcut() {
  const profileShortcut = document.getElementById("profileShortcut");
  const session = window.JanSevakSession.getSession();

  if (!profileShortcut) {
    return;
  }

  const labelSource = session.user?.name || session.user?.phone || "User";
  profileShortcut.textContent = String(labelSource).trim().charAt(0).toUpperCase() || "U";
}

initializeHomepage();
