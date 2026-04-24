const fs = require("fs/promises");
const path = require("path");

const { connectMongo } = require("./mongo");
const { getSchemeImageUrl } = require("./schemeImages");
const Scheme = require("../models/scheme");

const DATA_FILE = path.join(__dirname, "..", "..", "data", "schemes.json");

let cachedSchemes = null;
let repositoryState = {
  initialized: false,
  storage: "json",
  count: 0,
  syncedAt: null
};

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(
        {
          meta: {
            source: "myScheme",
            syncedAt: null,
            total: 0
          },
          schemes: []
        },
        null,
        2
      ),
      "utf8"
    );
  }
}

async function loadJsonSchemes() {
  await ensureDataFile();

  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw);

  cachedSchemes = parsed.schemes || [];
  repositoryState = {
    initialized: true,
    storage: "json",
    count: cachedSchemes.length,
    syncedAt: parsed.meta?.syncedAt || null
  };

  return repositoryState;
}

async function initializeRepository() {
  if (repositoryState.initialized) {
    return repositoryState;
  }

  try {
    const mongoAvailable = await connectMongo();

    if (mongoAvailable) {
      const count = await Scheme.countDocuments();
      repositoryState = {
        initialized: true,
        storage: "mongodb",
        count,
        syncedAt: null
      };
      return repositoryState;
    }
  } catch (error) {
    console.warn("MongoDB unavailable, falling back to JSON:", error.message);
  }

  return loadJsonSchemes();
}

async function getSourceSchemes() {
  const stats = await initializeRepository();

  if (stats.storage === "mongodb") {
    return Scheme.find({}).lean();
  }

  if (!cachedSchemes) {
    await loadJsonSchemes();
  }

  return cachedSchemes;
}

function normalizeScheme(scheme) {
  return {
    ...scheme,
    image_url: scheme.image_url || getSchemeImageUrl(scheme)
  };
}

function filterSchemes(schemes, filters) {
  const normalizedState = filters.state?.trim().toLowerCase();
  const normalizedCategory = filters.category?.trim().toLowerCase();
  const normalizedSearch = filters.search?.trim().toLowerCase();

  return schemes.filter((scheme) => {
    const normalizedScheme = normalizeScheme(scheme);
    const stateMatch =
      !normalizedState ||
      normalizedState === "view all" ||
      normalizedState === "all" ||
      normalizedScheme.state.toLowerCase() === normalizedState;

    const categoryMatch =
      !normalizedCategory ||
      normalizedCategory === "all" ||
      normalizedScheme.category.toLowerCase() === normalizedCategory;

    const searchMatch =
      !normalizedSearch ||
      [
        normalizedScheme.name,
        normalizedScheme.description,
        normalizedScheme.benefits,
        normalizedScheme.eligibility
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return stateMatch && categoryMatch && searchMatch;
  });
}

async function getSchemes(filters) {
  const schemes = (await getSourceSchemes()).map(normalizeScheme);
  const filtered = filterSchemes(schemes, filters);
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(24, Math.max(1, Number(filters.limit) || 12));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  const states = [...new Set(schemes.map((scheme) => scheme.state))].sort((a, b) =>
    a.localeCompare(b)
  );
  const categories = [...new Set(schemes.map((scheme) => scheme.category))].sort((a, b) =>
    a.localeCompare(b)
  );

  return {
    data: paginated,
    meta: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      availableStates: states,
      availableCategories: categories,
      storage: repositoryState.storage,
      syncedAt: repositoryState.syncedAt
    }
  };
}

async function getSchemeById(id) {
  const schemes = await getSourceSchemes();
  const scheme = schemes.find((entry) => entry.id === id);
  return scheme ? normalizeScheme(scheme) : null;
}

async function replaceJsonSchemes(payload) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
  repositoryState.initialized = false;
  cachedSchemes = null;
  await loadJsonSchemes();
}

async function replaceMongoSchemes(schemes) {
  await connectMongo();
  await Scheme.deleteMany({});
  await Scheme.insertMany(schemes, { ordered: false });
  repositoryState.initialized = false;
  await initializeRepository();
}

module.exports = {
  DATA_FILE,
  getSchemeById,
  getSchemes,
  initializeRepository,
  replaceJsonSchemes,
  replaceMongoSchemes
};
