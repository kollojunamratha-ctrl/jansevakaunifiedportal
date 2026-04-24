const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");

const { buildSeedDataset } = require("../services/officialSync");
const {
  replaceJsonSchemes,
  replaceMongoSchemes
} = require("../services/schemeRepository");
const { connectMongo } = require("../services/mongo");

dotenv.config();

const SLUG_FILE = path.join(__dirname, "..", "..", "data", "seed-slugs.json");

async function readAdditionalSlugs() {
  try {
    const raw = await fs.readFile(SLUG_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const additionalSlugs = await readAdditionalSlugs();
  const payload = await buildSeedDataset({ additionalSlugs });

  await replaceJsonSchemes(payload);

  try {
    const mongoAvailable = await connectMongo();

    if (mongoAvailable) {
      await replaceMongoSchemes(payload.schemes);
    }
  } catch (error) {
    console.warn("MongoDB sync skipped:", error.message);
  }

  console.log(`Synced ${payload.schemes.length} schemes from official myScheme sources.`);
}

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exitCode = 1;
});
