const params = new URLSearchParams(window.location.search);

const appState = {
  state: params.get("state") || "",
  category: params.get("category") || "",
  search: params.get("search") || "",
  language: window.JanSevakSession.getLanguage()
};

function getTranslations() {
  return (
    window.JANSEVAK_TRANSLATIONS?.[appState.language] ||
    window.JANSEVAK_TRANSLATIONS?.en ||
    {}
  );
}

function getStateLabel(state) {
  const translations = getTranslations();
  return translations.stateNames?.[state] || state;
}

function getCategoryLabel(category) {
  const translations = getTranslations();
  return translations.homeCategoryLabels?.[category] || category;
}

function getHeadingText() {
  if (appState.state) {
    return getStateLabel(appState.state);
  }

  if (appState.category) {
    return getCategoryLabel(appState.category);
  }

  if (appState.search) {
    return appState.search;
  }

  return getTranslations().schemes || "Schemes";
}

function getSubheadingText(total) {
  const translations = getTranslations();

  if (appState.state) {
    return `${total} ${translations.schemesFound || "schemes found"}`;
  }

  if (appState.category) {
    return `${total} ${translations.schemesFound || "schemes found"}`;
  }

  if (appState.search) {
    return `${translations.searchPlaceholder || "Search government schemes..."} "${appState.search}"`;
  }

  return `${total} ${translations.schemesFound || "schemes found"}`;
}

async function fetchSchemes() {
  const query = new URLSearchParams({
    page: "1",
    limit: "250",
    language: "en"
  });

  if (appState.state) {
    query.set("state", appState.state);
  }

  if (appState.category) {
    query.set("category", appState.category);
  }

  if (appState.search) {
    query.set("search", appState.search);
  }

  const response = await fetch(window.JanSevakConfig.buildApiUrl(`/api/schemes?${query.toString()}`));

  if (!response.ok) {
    throw new Error("Unable to fetch schemes");
  }

  return response.json();
}

function buildSpeechText(scheme) {
  const t = getTranslations();

  return [
    scheme.name,
    `${t.description || "Description"}: ${scheme.description}`,
    `${t.eligibility || "Eligibility"}: ${scheme.eligibility}`,
    `${t.benefits || "Benefits"}: ${scheme.benefits}`,
    `${t.applicationProcess || "Application process"}: ${scheme.application_process}`
  ]
    .filter(Boolean)
    .join(". ");
}

function hydrateSchemeCard(node, scheme) {
  const t = getTranslations();
  const image = node.querySelector(".scheme-image");
  const categoryPill = node.querySelector(".category-pill");
  const name = node.querySelector(".scheme-name");
  const description = node.querySelector(".scheme-description");
  const stateBadge = node.querySelector(".state-badge");
  const voiceButton = node.querySelector(".voice-button");
  const viewButton = node.querySelector(".view-button");

  image.src = window.JanSevakConfig.buildApiUrl(scheme.image_url);
  image.alt = scheme.name;
  categoryPill.textContent = getCategoryLabel(scheme.category);
  name.textContent = scheme.name;
  description.textContent = scheme.description;
  stateBadge.textContent = scheme.state === "All" ? t.centralGovt || "Central Govt" : getStateLabel(scheme.state);

  voiceButton.title = t.listen || "Listen";
  voiceButton.setAttribute("aria-label", t.listen || "Listen");
  voiceButton.addEventListener("click", () => {
    window.toggleSpeech(buildSpeechText(scheme), voiceButton);
  });

  viewButton.textContent = t.viewDetails || "View Details";
  viewButton.href = window.JanSevakSchemeUtils.buildSchemeDetailUrl(scheme, appState.language, {
    state: appState.state,
    category: appState.category
  });
}

function renderSchemes(schemes, total) {
  const t = getTranslations();
  const cardsGrid = document.getElementById("cardsGrid");
  const template = document.getElementById("schemeCardTemplate");

  document.getElementById("pageHeading").textContent = getHeadingText();
  document.getElementById("pageSubheading").textContent = getSubheadingText(total);

  cardsGrid.innerHTML = "";

  if (!schemes.length) {
    cardsGrid.innerHTML = `
      <div class="col-span-full rounded-3xl border border-white/10 bg-panel p-10 text-center">
        <p class="text-lg font-semibold">${t.noSchemesTitle || "No schemes matched these filters."}</p>
        <p class="mt-2 text-sm text-slate-400">${t.noSchemesHint || "Try another category or search keyword."}</p>
      </div>
    `;
    return;
  }

  schemes.forEach((scheme) => {
    const node = template.content.cloneNode(true);
    hydrateSchemeCard(node, scheme);
    cardsGrid.appendChild(node);
  });
}

async function initializePage() {
  if (!window.JanSevakSession.requireAuth()) {
    return;
  }

  window.JanSevakNavigation?.renderPageNavigation("pageNav", {
    showProfile: true,
    showSession: true
  });
  document.getElementById("pageHeading").textContent = getHeadingText();

  try {
    const payload = await fetchSchemes();
    const translatedSchemes =
      appState.language === "en"
        ? payload.data
        : await window.JanSevakSchemeUtils.translateSchemes(payload.data, appState.language);

    renderSchemes(translatedSchemes, payload.meta.total);
  } catch (error) {
    const t = getTranslations();
    document.getElementById("cardsGrid").innerHTML = `
      <div class="col-span-full rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center">
        <p class="text-lg font-semibold">${t.unableToLoadScheme || "Unable to load scheme"}</p>
        <p class="mt-2 text-sm text-slate-300">${error.message}</p>
      </div>
    `;
  }
}

initializePage();
