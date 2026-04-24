const profileState = {
  language: window.JanSevakSession.getLanguage(),
  profile: null
};

function getTranslations() {
  return (
    window.JANSEVAK_TRANSLATIONS?.[profileState.language] ||
    window.JANSEVAK_TRANSLATIONS?.en ||
    {}
  );
}

function getStateLabel(state) {
  const translations = getTranslations();
  return translations.stateNames?.[state] || state;
}

function hasProfileDetails(profile) {
  return Boolean(
    profile?.name ||
      profile?.age != null ||
      profile?.state ||
      profile?.address ||
      profile?.aadhar ||
      (profile?.schemesApplied ?? 0) > 0
  );
}

function renderDetailItem(label, value, extraClass = "") {
  return `
    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 ${extraClass}">
      <dt class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">${label}</dt>
      <dd class="mt-3 text-base font-semibold text-white">${value}</dd>
    </div>
  `;
}

function setStatus(message, isError = false) {
  const status = document.getElementById("profileStatus");

  if (!status) {
    return;
  }

  if (!message) {
    status.className = "mt-6 hidden";
    status.textContent = "";
    return;
  }

  status.textContent = message;
  status.className = `mt-6 rounded-2xl border px-4 py-3 text-sm ${
    isError
      ? "border-red-500/30 bg-red-500/10 text-red-100"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
  }`;
}

function applyStaticTranslations() {
  const t = getTranslations();

  document.title = `${t.profile || "Profile"} | JanSevak`;
  document.getElementById("profileEyebrow").textContent = t.profile || "Profile";
  document.getElementById("profileTitle").textContent = t.profileTitle || "Your Profile";
  document.getElementById("profileSubtitle").textContent =
    t.profileSubtitle || "Manage your personal details for a smoother JanSevak experience.";
  document.getElementById("profileLoadingText").textContent =
    t.loadingProfile || "Loading your profile...";
  document.getElementById("nameLabel").textContent = t.name || "Name";
  document.getElementById("ageLabel").textContent = t.age || "Age";
  document.getElementById("stateLabel").textContent = t.state || "State";
  document.getElementById("phoneLabel").textContent = t.phone || "Phone";
  document.getElementById("addressLabel").textContent = t.address || "Address";
  document.getElementById("aadharLabel").textContent = t.aadhar || "Aadhar";
  document.getElementById("saveProfileButton").textContent = t.saveProfile || "Save Details";
  document.getElementById("cancelProfileButton").textContent = t.cancel || "Cancel";
}

function openProfileForm() {
  const formSection = document.getElementById("profileFormSection");
  const form = document.getElementById("profileForm");

  if (profileState.profile) {
    form.name.value = profileState.profile.name || "";
    form.age.value = profileState.profile.age ?? "";
    form.state.value = profileState.profile.state || "";
    form.address.value = profileState.profile.address || "";
    form.phone.value = profileState.profile.phone || "";
    form.aadhar.value = profileState.profile.aadhar || "";
  }

  formSection.classList.remove("hidden");
}

function closeProfileForm() {
  document.getElementById("profileFormSection").classList.add("hidden");
}

function renderProfileView() {
  const t = getTranslations();
  const container = document.getElementById("profileViewCard");
  const profile = profileState.profile;

  if (!profile) {
    container.innerHTML = `<p class="text-sm text-slate-400">${t.loadingProfile || "Loading your profile..."}</p>`;
    return;
  }

  if (!hasProfileDetails(profile)) {
    container.innerHTML = `
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold">${t.profileEmptyTitle || "No profile details added yet."}</h2>
          <p class="mt-2 text-sm text-slate-400">${t.profileEmptyHint || "Add your details so we can personalize your scheme journey."}</p>
        </div>
        <button id="addDetailsButton" type="button" class="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
          ${t.addDetails || "Add Details"}
        </button>
      </div>
    `;
    document.getElementById("addDetailsButton")?.addEventListener("click", openProfileForm);
    return;
  }

  container.innerHTML = `
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold">${t.profileDetails || "Profile Details"}</h2>
          <p class="mt-2 text-sm text-slate-400">${t.profileSubtitle || "Manage your personal details for a smoother JanSevak experience."}</p>
        </div>
        <button id="editProfileButton" type="button" class="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-accent hover:text-white">
          ${t.edit || "Edit"}
        </button>
      </div>
      <dl class="grid gap-4 md:grid-cols-2">
        ${renderDetailItem(t.name || "Name", profile.name || "-")}
        ${renderDetailItem(t.age || "Age", profile.age ?? "-")}
        ${renderDetailItem(t.state || "State", profile.state ? getStateLabel(profile.state) : "-")}
        ${renderDetailItem(t.phone || "Phone", profile.phone || "-")}
        ${renderDetailItem(t.aadhar || "Aadhar", profile.aadhar || "-")}
        ${renderDetailItem(t.schemesApplied || "Schemes Applied", profile.schemesApplied ?? 0)}
        ${renderDetailItem(t.address || "Address", profile.address || "-", "md:col-span-2")}
      </dl>
    </div>
  `;

  document.getElementById("editProfileButton")?.addEventListener("click", openProfileForm);
}

async function fetchProfile() {
  const response = await fetch(window.JanSevakConfig.buildApiUrl("/api/profile"), {
    headers: window.JanSevakSession.getAuthHeaders()
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Unable to load profile");
  }

  return data.profile;
}

async function saveProfile(payload) {
  const response = await fetch(window.JanSevakConfig.buildApiUrl("/api/profile"), {
    method: "POST",
    headers: window.JanSevakSession.getAuthHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.details || "Unable to save profile");
  }

  return data.profile;
}

function bindProfileForm() {
  const form = document.getElementById("profileForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      const nextProfile = await saveProfile({
        name: form.name.value,
        age: form.age.value,
        state: form.state.value,
        address: form.address.value,
        phone: form.phone.value,
        aadhar: form.aadhar.value
      });

      profileState.profile = nextProfile;
      window.JanSevakSession.updateSessionUser({
        phone: nextProfile.phone,
        name: nextProfile.name
      });
      closeProfileForm();
      renderProfileView();
      setStatus(getTranslations().updateProfileSuccess || "Profile saved successfully.");
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  document.getElementById("cancelProfileButton")?.addEventListener("click", () => {
    closeProfileForm();
    setStatus("");
  });
}

async function initializeProfilePage() {
  if (!window.JanSevakSession.requireAuth()) {
    return;
  }

  window.JanSevakNavigation?.renderPageNavigation("pageNav", {
    showProfile: false,
    showSession: false
  });
  applyStaticTranslations();
  window.JanSevakSession.renderSessionControls("sessionControls");
  window.JanSevakSession.hydrateLanguageSelect("languageSelect", (language) => {
    profileState.language = language;
    window.JanSevakNavigation?.renderPageNavigation("pageNav", {
      showProfile: false,
      showSession: false
    });
    applyStaticTranslations();
    renderProfileView();
  });
  bindProfileForm();

  try {
    profileState.profile = await fetchProfile();
    renderProfileView();
  } catch (error) {
    setStatus(error.message, true);
    document.getElementById("profileViewCard").innerHTML = `
      <div class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p class="text-lg font-semibold">${error.message}</p>
      </div>
    `;
  }
}

initializeProfilePage();
