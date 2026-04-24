(function initializeJanSevakSchemeUtils() {
  const TRANSLATION_STORAGE_PREFIX = "jansevak-translation-v1";
  const runtimeTranslationCache = new Map();
  const categoryLabels = {
    Agriculture: {
      hi: "कृषि",
      te: "వ్యవసాయం",
      ta: "விவசாயம்"
    },
    Women: {
      hi: "महिला",
      te: "మహిళలు",
      ta: "பெண்கள்"
    },
    Health: {
      hi: "स्वास्थ्य",
      te: "ఆరోగ్యం",
      ta: "சுகாதாரம்"
    },
    Education: {
      hi: "शिक्षा",
      te: "విద్య",
      ta: "கல்வி"
    },
    General: {
      hi: "सामान्य",
      te: "సాధారణం",
      ta: "பொது"
    }
  };

  let voices = [];
  let activeSpeechButton = null;
  const voiceWaiters = new Set();
  function initializeVoices() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    voices = window.speechSynthesis.getVoices();
  }

  function flushVoiceWaiters() {
    if (!voices.length || !voiceWaiters.size) {
      return;
    }

    for (const resolve of voiceWaiters) {
      resolve(voices);
    }

    voiceWaiters.clear();
  }

  initializeVoices();

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      initializeVoices();
      flushVoiceWaiters();
    };
  }

  function getVoiceLang(lang) {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "te":
        return "te-IN";
      case "ta":
        return "ta-IN";
      default:
        return "en-IN";
    }
  }

  function getGoogleTtsLang(lang) {
    switch (lang) {
      case "hi":
        return "hi";
      case "te":
        return "te";
      case "ta":
        return "ta";
      default:
        return "en";
    }
  }

  function setSpeechButtonState(button, isSpeaking) {
    if (!button) {
      return;
    }

    const currentLanguage = localStorage.getItem("language") || "en";
    const translations = window.JANSEVAK_TRANSLATIONS?.[currentLanguage] || {};
    const label = isSpeaking
      ? translations.stop || "Stop"
      : translations.listen || "Listen";

    button.setAttribute("aria-pressed", isSpeaking ? "true" : "false");
    button.setAttribute("aria-label", label);
    button.title = label;
    button.classList.toggle("border-accent", isSpeaking);
    button.classList.toggle("bg-accentSoft", isSpeaking);
    button.classList.toggle("text-accent", isSpeaking);
  }

  function resetSpeechButton() {
    if (!activeSpeechButton) {
      return;
    }

    setSpeechButtonState(activeSpeechButton, false);
    activeSpeechButton = null;
  }

  function stopActiveAudio() {
    if (!window.currentAudio) {
      return;
    }

    window.currentAudio.pause();
    window.currentAudio.src = "";
    window.currentAudio = null;
  }

  function stopPlayback() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    stopActiveAudio();
    resetSpeechButton();
  }

  function waitForVoices(timeoutMs = 1500) {
    if (!("speechSynthesis" in window)) {
      return Promise.resolve([]);
    }

    initializeVoices();
    if (voices.length) {
      return Promise.resolve(voices);
    }

    return new Promise((resolve) => {
      const finish = (availableVoices = voices) => {
        window.clearTimeout(timeoutId);
        voiceWaiters.delete(finish);
        resolve(availableVoices);
      };

      const timeoutId = window.setTimeout(() => {
        initializeVoices();
        finish(voices);
      }, timeoutMs);

      voiceWaiters.add(finish);
    });
  }

  function findVoiceForLanguage(langCode) {
    const normalizedCode = (langCode || "").toLowerCase();
    const langPrefix = normalizedCode.split("-")[0];

    return (
      voices.find((entry) => entry.lang?.toLowerCase() === normalizedCode) ||
      voices.find((entry) => entry.lang?.toLowerCase().startsWith(`${langPrefix}-`)) ||
      voices.find((entry) => entry.lang?.toLowerCase().startsWith(langPrefix)) ||
      null
    );
  }

  function buildGoogleTtsUrl(text, lang) {
    const params = new URLSearchParams({
      ie: "UTF-8",
      client: "tw-ob",
      tl: getGoogleTtsLang(lang),
      q: text
    });

    return `https://translate.google.com/translate_tts?${params.toString()}`;
  }

  async function toggleSpeech(text, button) {
    if (!text || !text.trim()) {
      return;
    }

    const currentLanguage = localStorage.getItem("language") || "en";
    const isSameButton = activeSpeechButton && button && activeSpeechButton === button;
    const isCurrentlyPlaying =
      ("speechSynthesis" in window && window.speechSynthesis.speaking) ||
      (window.currentAudio && !window.currentAudio.paused);

    if (isCurrentlyPlaying && isSameButton) {
      stopPlayback();
      return;
    }

    if (isCurrentlyPlaying) {
      stopPlayback();
    }

    activeSpeechButton = button || null;
    setSpeechButtonState(activeSpeechButton, true);

    const finalizeSpeech = () => {
      stopActiveAudio();
      resetSpeechButton();
    };

    if (currentLanguage !== "en") {
      const audio = new Audio(buildGoogleTtsUrl(text, currentLanguage));
      audio.onended = finalizeSpeech;
      audio.onerror = finalizeSpeech;
      window.currentAudio = audio;

      try {
        await audio.play();
      } catch {
        finalizeSpeech();
      }

      return;
    }

    if (!("speechSynthesis" in window)) {
      finalizeSpeech();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = getVoiceLang(currentLanguage);

    await waitForVoices();

    utterance.lang = langCode;

    const voice = findVoiceForLanguage(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = finalizeSpeech;
    utterance.onerror = finalizeSpeech;

    window.speechSynthesis.speak(utterance);
  }

  function normalizeText(value) {
    if (Array.isArray(value)) {
      return value
        .map((item) => normalizeText(item))
        .filter(Boolean)
        .join("\n");
    }

    if (typeof value !== "string") {
      return "";
    }

    return value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/&nbsp;/gi, " ")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/<[^>]+>/g, "")
      .trim();
  }

  function getCacheKey(text, targetLang) {
    return `${TRANSLATION_STORAGE_PREFIX}:${targetLang}:${text}`;
  }

  async function requestTranslation(text, targetLang) {
    const body = {
      q: text,
      source: "en",
      target: targetLang,
      format: "text"
    };

    try {
      const response = await fetch(window.JanSevakConfig.buildApiUrl("/api/translate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const payload = await response.json();
        if (typeof payload.translatedText === "string") {
          return payload.translatedText;
        }
      }
    } catch {
      // Fall through to the direct browser request.
    }

    const params = new URLSearchParams({
      client: "gtx",
      sl: body.source,
      tl: body.target,
      dt: "t",
      q: body.q
    });

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Translation request failed");
    }

    const payload = await response.json();
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
      return text;
    }

    const translatedText = payload[0]
      .map((entry) => (Array.isArray(entry) ? entry[0] : ""))
      .filter(Boolean)
      .join("");

    return translatedText || text;
  }

  async function translateText(text, targetLang) {
    const normalizedText = normalizeText(text);

    if (!normalizedText || targetLang === "en") {
      return normalizedText;
    }

    const cacheKey = getCacheKey(normalizedText, targetLang);

    if (runtimeTranslationCache.has(cacheKey)) {
      return runtimeTranslationCache.get(cacheKey);
    }

    try {
      const cachedValue = sessionStorage.getItem(cacheKey);
      if (cachedValue) {
        runtimeTranslationCache.set(cacheKey, cachedValue);
        return cachedValue;
      }
    } catch {
      // Ignore storage access issues.
    }

    try {
      const translatedText = await requestTranslation(normalizedText, targetLang);
      runtimeTranslationCache.set(cacheKey, translatedText);

      try {
        sessionStorage.setItem(cacheKey, translatedText);
      } catch {
        // Ignore storage access issues.
      }

      return translatedText;
    } catch {
      runtimeTranslationCache.set(cacheKey, normalizedText);
      return normalizedText;
    }
  }

  async function translateScheme(scheme, lang) {
    if (!scheme || lang === "en") {
      return {
        ...scheme,
        category: normalizeCategoryLabel(scheme.category, lang)
      };
    }

    const name = await translateText(scheme.name, lang);
    const description = await translateText(scheme.description, lang);
    const eligibility = await translateText(scheme.eligibility, lang);
    const benefits = await translateText(scheme.benefits, lang);
    const applicationProcess = await translateText(scheme.application_process, lang);

    return {
      ...scheme,
      category: normalizeCategoryLabel(scheme.category, lang),
      name,
      description,
      eligibility,
      benefits,
      application_process: applicationProcess
    };
  }

  function normalizeCategoryLabel(category, lang) {
    if (!category || lang === "en") {
      return category || "";
    }

    return categoryLabels[category]?.[lang] || category;
  }

  async function translateSchemes(schemes, lang) {
    const translated = [];

    for (const scheme of schemes || []) {
      translated.push(await translateScheme(scheme, lang));
    }

    return translated;
  }

  function buildSchemeDetailUrl(scheme, language, context = {}) {
    const params = new URLSearchParams({
      id: scheme.id,
      lang: language || localStorage.getItem("language") || "en"
    });

    if (context.state) {
      params.set("state", context.state);
    } else if (scheme.state && scheme.state !== "All") {
      params.set("state", scheme.state);
    }

    if (context.category && context.category !== "All") {
      params.set("category", context.category);
    } else if (scheme.category && scheme.category !== "All") {
      params.set("category", scheme.category);
    }

    return `/scheme-details.html?${params.toString()}`;
  }

  window.toggleSpeech = toggleSpeech;
  window.JanSevakSchemeUtils = {
    buildSchemeDetailUrl,
    getVoiceLang,
    normalizeCategoryLabel,
    resetSpeechButton,
    toggleSpeech,
    translateScheme,
    translateSchemes,
    translateText
  };

  window.addEventListener("beforeunload", () => {
    stopPlayback();
  });
})();
