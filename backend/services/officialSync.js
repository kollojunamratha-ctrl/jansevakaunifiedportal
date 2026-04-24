const https = require("https");
const { execFile } = require("child_process");
const { promisify } = require("util");

const { getSchemeImageUrl } = require("./schemeImages");

const execFileAsync = promisify(execFile);

const SEARCH_API_BASE = "https://api.myscheme.gov.in/search/v6";
const SCHEME_API_BASE = "https://api.myscheme.gov.in/schemes/v6/public/schemes";
const API_KEY = "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc";
const DEFAULT_TARGET_COUNT = Number(process.env.SYNC_TARGET_COUNT || 120);
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DISCOVERY_TARGETS = [
  ["beneficiaryState", "Telangana"],
  ["beneficiaryState", "Andhra Pradesh"],
  ["beneficiaryState", "Karnataka"],
  ["beneficiaryState", "Tamil Nadu"],
  ["beneficiaryState", "Maharashtra"],
  ["beneficiaryState", "Delhi"],
  ["beneficiaryState", "Gujarat"],
  ["beneficiaryState", "Rajasthan"],
  ["beneficiaryState", "Uttar Pradesh"],
  ["beneficiaryState", "West Bengal"],
  ["beneficiaryState", "Bihar"],
  ["beneficiaryState", "Madhya Pradesh"],
  ["beneficiaryState", "Kerala"],
  ["beneficiaryState", "Odisha"],
  ["beneficiaryState", "Haryana"],
  ["schemeCategory", "Education & Learning"],
  ["schemeCategory", "Health & Wellness"],
  ["schemeCategory", "Skills & Employment"],
  ["schemeCategory", "Women and Child"],
  ["schemeCategory", "Agriculture,Rural & Environment"]
];

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
          accept: "application/json, text/plain, */*",
          origin: "https://www.myscheme.gov.in",
          referer: "https://www.myscheme.gov.in/",
          "accept-language": "en-IN,en;q=0.9",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
        }
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");

          if (response.statusCode >= 400) {
            return reject(
              new Error(`Request failed (${response.statusCode}) for ${url}: ${raw.slice(0, 300)}`)
            );
          }

          try {
            resolve(JSON.parse(raw));
          } catch (error) {
            reject(new Error(`Invalid JSON from ${url}: ${error.message}`));
          }
        });
      }
    );

    request.on("error", reject);
    request.end();
  });
}

function slateToText(nodes) {
  if (!nodes) {
    return "";
  }

  if (typeof nodes === "string") {
    return nodes;
  }

  if (Array.isArray(nodes)) {
    return nodes
      .map((node) => {
        if (node.text !== undefined) {
          return node.text;
        }

        if (node.children) {
          const childText = slateToText(node.children);
          if (node.type === "list_item") {
            return `- ${childText}`;
          }
          return childText;
        }

        return "";
      })
      .filter(Boolean)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return "";
}

function normalizeSchemeRecord(summaryItem, detailPayload) {
  const basic = detailPayload.basic?.basicDetails || {};
  const content = detailPayload.basic?.schemeContent || {};
  const applicationProcess = detailPayload.basic?.applicationProcess || [];
  const eligibilityCriteria = detailPayload.basic?.eligibilityCriteria || {};
  const officialReference = content.references?.find((reference) =>
    reference.title?.toLowerCase().includes("official website")
  );

  const state =
    basic.state?.label ||
    basic.state ||
    summaryItem.fields?.beneficiaryState?.[0] ||
    "All";

  const category =
    basic.schemeCategory?.[0]?.label ||
    summaryItem.fields?.schemeCategory?.[0] ||
    "Other";

  const applicationMode = applicationProcess[0];
  const officialLink =
    officialReference?.url ||
    applicationMode?.url ||
    content.references?.[0]?.url ||
    `https://www.myscheme.gov.in/schemes/${summaryItem.fields.slug}`;

  return {
    id: summaryItem.fields.slug,
    name: basic.schemeName || summaryItem.fields.schemeName,
    state,
    category,
    description:
      content.briefDescription ||
      slateToText(content.detailedDescription) ||
      summaryItem.fields.briefDescription ||
      "Description not available.",
    eligibility:
      eligibilityCriteria.eligibilityDescription_md?.replace(/\n+/g, "\n").trim() ||
      slateToText(eligibilityCriteria.eligibilityDescription) ||
      "Eligibility details not available.",
    benefits:
      slateToText(content.benefits) ||
      summaryItem.fields.briefDescription ||
      "Benefits details not available.",
    application_process:
      `${applicationMode?.mode || "Online/Offline"}\n${slateToText(applicationMode?.process)}`.trim(),
    official_link: officialLink,
    image_url: getSchemeImageUrl({ id: summaryItem.fields.slug }),
    source: "myScheme",
    source_slug: summaryItem.fields.slug,
    language: "en"
  };
}

async function fetchDetailBySlug(slug) {
  const basicResponse = await requestJson(`${SCHEME_API_BASE}?slug=${encodeURIComponent(slug)}&lang=en`);

  if (!basicResponse?.data?._id) {
    throw new Error(`No scheme detail found for slug "${slug}"`);
  }

  const schemeId = basicResponse.data._id;

  const [documentsResponse, faqsResponse] = await Promise.all([
    requestJson(`${SCHEME_API_BASE}/${schemeId}/documents?lang=en`),
    requestJson(`${SCHEME_API_BASE}/${schemeId}/faqs?lang=en`)
  ]);

  return {
    basic: basicResponse.data.en || null,
    documents: documentsResponse.data?.en || null,
    faqs: faqsResponse.data?.en || null
  };
}

async function fetchSeedSummaryPage() {
  const response = await requestJson(`${SEARCH_API_BASE}/schemes?lang=en`);
  return response?.data?.hits?.items || [];
}

async function discoverSlugsWithEdge() {
  const slugMap = new Map();

  for (const [identifier, value] of DISCOVERY_TARGETS) {
    const url = `https://www.myscheme.gov.in/search?identifier=${encodeURIComponent(
      identifier
    )}&value=${encodeURIComponent(value)}`;

    try {
      const { stdout } = await execFileAsync(
        EDGE_PATH,
        [
          "--headless",
          "--disable-gpu",
          "--virtual-time-budget=12000",
          "--dump-dom",
          url
        ],
        {
          maxBuffer: 20 * 1024 * 1024,
          windowsHide: true
        }
      );

      const matches = stdout.match(/\/schemes\/([a-z0-9-]+)/g) || [];
      for (const match of matches) {
        const slug = match.replace("/schemes/", "");
        const existing = slugMap.get(slug) || {
          slug,
          beneficiaryState: identifier === "beneficiaryState" ? [value] : ["All"],
          schemeCategory: identifier === "schemeCategory" ? [value] : ["Other"]
        };

        if (identifier === "beneficiaryState") {
          existing.beneficiaryState = [value];
        }

        if (identifier === "schemeCategory") {
          existing.schemeCategory = [value];
        }

        slugMap.set(slug, existing);
      }
    } catch (error) {
      console.warn(`Slug discovery failed for ${identifier}=${value}: ${error.message}`);
    }
  }

  return [...slugMap.values()];
}

async function buildSeedDataset({
  targetCount = DEFAULT_TARGET_COUNT,
  additionalSlugs = []
} = {}) {
  const summaryItems = await fetchSeedSummaryPage();
  const discoveredEntries = await discoverSlugsWithEdge();
  const uniqueMap = new Map();

  for (const item of summaryItems) {
    if (item?.fields?.slug) {
      uniqueMap.set(item.fields.slug, item);
    }
  }

  for (const discovered of discoveredEntries) {
    if (!uniqueMap.has(discovered.slug)) {
      uniqueMap.set(discovered.slug, {
        fields: {
          slug: discovered.slug,
          schemeName: discovered.slug,
          beneficiaryState: discovered.beneficiaryState,
          schemeCategory: discovered.schemeCategory,
          briefDescription: ""
        }
      });
    }
  }

  for (const slug of additionalSlugs) {
    if (!uniqueMap.has(slug)) {
      uniqueMap.set(slug, {
        fields: {
          slug,
          schemeName: slug,
          beneficiaryState: ["All"],
          schemeCategory: ["Other"],
          briefDescription: ""
        }
      });
    }
  }

  const summaries = [...uniqueMap.values()].slice(0, targetCount);
  const schemes = [];

  for (const summaryItem of summaries) {
    try {
      const detailPayload = await fetchDetailBySlug(summaryItem.fields.slug);
      schemes.push(normalizeSchemeRecord(summaryItem, detailPayload));
    } catch (error) {
      console.warn(`Skipping ${summaryItem.fields.slug}: ${error.message}`);
    }
  }

  return {
    meta: {
      source: "myScheme",
      syncedAt: new Date().toISOString(),
      total: schemes.length,
      note:
        "Seeded from official myScheme APIs. Expand data/seed-slugs.json and re-run npm run sync-schemes for broader coverage."
    },
    schemes
  };
}

module.exports = {
  buildSeedDataset
};
