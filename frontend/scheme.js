function getTranslations(language) {
  return window.JANSEVAK_TRANSLATIONS?.[language] || window.JANSEVAK_TRANSLATIONS?.en || {};
}

function getCurrentLanguage() {
  return localStorage.getItem("language") || "en";
}

function getCategoryLabel(category, language) {
  return window.JanSevakSchemeUtils.normalizeCategoryLabel(category, language) || category;
}

function persistRecentScheme(scheme) {
  try {
    const recent = JSON.parse(localStorage.getItem("jansevak-recent") || "[]").filter(
      (item) => item.id !== scheme.id
    );
    recent.unshift({
      id: scheme.id,
      name: scheme.name,
      state: scheme.state,
      category: scheme.category,
      description: scheme.description,
      eligibility: scheme.eligibility,
      benefits: scheme.benefits,
      application_process: scheme.application_process,
      image_url: scheme.image_url
    });
    localStorage.setItem("jansevak-recent", JSON.stringify(recent.slice(0, 6)));
  } catch {
    // Ignore local storage failures.
  }
}

let currentSchemePayload = null;

function getSchemeId() {
  const queryId = new URLSearchParams(window.location.search).get("id");
  if (queryId) {
    return queryId;
  }

  const legacyId = window.location.pathname.split("/").pop();
  return legacyId && legacyId !== "scheme.html" ? legacyId : "";
}

async function loadScheme() {
  const schemeId = getSchemeId();
  const language = new URLSearchParams(window.location.search).get("lang") || getCurrentLanguage();

  if (!schemeId) {
    throw new Error("Scheme not found");
  }

  const response = await fetch(window.JanSevakConfig.buildApiUrl(`/api/schemes/${schemeId}`));

  if (!response.ok) {
    throw new Error("Scheme not found");
  }

  localStorage.setItem("language", language);

  const languageSelect = document.getElementById("languageSelect");
  if (languageSelect) {
    languageSelect.value = language;
  }

  return {
    scheme: await response.json(),
    language
  };
}

function updateBackLink() {
  const link = document.getElementById("backToSchemesLink");
  if (!link) {
    return;
  }

  const query = new URLSearchParams();
  const params = new URLSearchParams(window.location.search);
  const state = params.get("state");
  const category = params.get("category");

  if (state) {
    query.set("state", state);
  }

  if (category && category !== "All") {
    query.set("category", category);
  }

  const suffix = query.toString();
  link.href = suffix ? `/schemes.html?${suffix}` : "/schemes.html";
}

function applyStaticTranslations(language) {
  const t = getTranslations(language);
  document.getElementById("backToSchemesLink").textContent =
    `← ${t.backToSchemes || "Back to schemes"}`;
  document.getElementById("detailLoadingText").textContent =
    t.loadingSchemeDetails || "Loading scheme details...";
}

function createSection(title, content) {
  const section = document.createElement("section");
  section.className = "rounded-2xl border border-white/10 bg-slate-950/30 p-5";

  const heading = document.createElement("h2");
  heading.className = "text-lg font-bold";
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.className = "mt-3 whitespace-pre-line text-sm leading-7 text-slate-300";
  paragraph.textContent = content || "";

  section.append(heading, paragraph);
  return section;
}

async function renderScheme({ scheme, language }) {
  const t = getTranslations(language);
  const translatedScheme = await window.JanSevakSchemeUtils.translateScheme(scheme, language);

  document.title = `${translatedScheme.name} | JanSevak`;
  persistRecentScheme(scheme);
  updateBackLink();
  currentSchemePayload = {
    scheme,
    language
  };

  const container = document.getElementById("detailContainer");
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col gap-6";

  const image = document.createElement("img");
  image.src = window.JanSevakConfig.buildApiUrl(translatedScheme.image_url);
  image.alt = translatedScheme.name;
  image.className = "h-72 w-full rounded-3xl object-cover";

  const header = document.createElement("div");
  header.className = "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between";

  const summary = document.createElement("div");

  const stateBadge = document.createElement("span");
  stateBadge.className =
    "inline-flex rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent";
  stateBadge.textContent =
    translatedScheme.state === "All" ? t.centralGovt || "Central Govt" : translatedScheme.state;

  const title = document.createElement("h1");
  title.className = "mt-3 text-3xl font-black leading-tight";
  title.textContent = translatedScheme.name;

  const category = document.createElement("p");
  category.className = "mt-2 text-sm text-slate-400";
  category.textContent = getCategoryLabel(translatedScheme.category, language);

  summary.append(stateBadge, title, category);

  const actions = document.createElement("div");
  actions.className = "flex flex-wrap gap-3";

  const listenButton = document.createElement("button");
  listenButton.id = "listenButton";
  listenButton.type = "button";
  listenButton.className =
    "inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50 text-xl transition hover:border-accent hover:text-accent";
  listenButton.textContent = "🔊";
  listenButton.title = t.listen || "Listen";
  listenButton.setAttribute("aria-label", t.listen || "Listen");

  const officialLink = document.createElement("a");
  officialLink.href = translatedScheme.official_link || "#";
  officialLink.target = "_blank";
  officialLink.rel = "noopener noreferrer";
  officialLink.className = "rounded-xl border border-white/10 px-4 py-3 text-sm";
  officialLink.textContent = t.officialSite || "Official website";

  actions.append(listenButton, officialLink);
  header.append(summary, actions);

  const descriptionSection = createSection(
    t.description || "Description",
    translatedScheme.description
  );

  const grid = document.createElement("section");
  grid.className = "grid gap-5 lg:grid-cols-2";
  grid.append(
    createSection(t.eligibility || "Eligibility", translatedScheme.eligibility),
    createSection(t.benefits || "Benefits", translatedScheme.benefits)
  );

  const applicationSection = createSection(
    t.applicationProcess || "Application process",
    translatedScheme.application_process
  );

  wrapper.append(image, header, descriptionSection, grid, applicationSection);
  container.appendChild(wrapper);

  listenButton.addEventListener("click", () => {
    const speechText = [
      translatedScheme.name,
      `${t.description || "Description"}: ${translatedScheme.description}`,
      `${t.eligibility || "Eligibility"}: ${translatedScheme.eligibility}`,
      `${t.benefits || "Benefits"}: ${translatedScheme.benefits}`,
      `${t.applicationProcess || "Application process"}: ${translatedScheme.application_process}`
    ]
      .filter(Boolean)
      .join(". ");

    window.toggleSpeech(speechText, listenButton);
  });
}

function initializeDetailPage() {
  const initialLanguage = getCurrentLanguage();
  window.JanSevakNavigation?.renderPageNavigation("pageNav", {
    showProfile: true,
    showSession: false
  });
  applyStaticTranslations(initialLanguage);

  window.JanSevakSession.hydrateLanguageSelect("languageSelect", (language) => {
    localStorage.setItem("language", language);
    window.JanSevakNavigation?.renderPageNavigation("pageNav", {
      showProfile: true,
      showSession: false
    });
    applyStaticTranslations(language);

    if (currentSchemePayload) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", language);
      window.history.replaceState({}, "", url.toString());
    }

    window.location.reload();
  });
  window.JanSevakSession.renderSessionControls("sessionControls");
  updateBackLink();
}

initializeDetailPage();

loadScheme()
  .then(renderScheme)
  .catch((error) => {
    const t = getTranslations(getCurrentLanguage());
    document.getElementById("detailContainer").innerHTML = `
      <div class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p class="text-lg font-semibold">${t.unableToLoadScheme || "Unable to load scheme"}</p>
        <p class="mt-2 text-sm text-slate-300">${error.message}</p>
      </div>
    `;
  });
