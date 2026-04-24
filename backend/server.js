const path = require("path");
const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const schemeRoutes = require("./routes/schemes");
const translateRoutes = require("./routes/translate");
const { initializeRepository } = require("./services/schemeRepository");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", async (_req, res) => {
  const stats = await initializeRepository();
  res.json({
    status: "ok",
    storage: stats.storage,
    totalSchemes: stats.count,
    syncedAt: stats.syncedAt
  });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "login.html"));
});

app.use("/api/schemes", schemeRoutes);
app.use("/api", translateRoutes);
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use("/data", express.static(path.join(__dirname, "..", "data")));

app.get("/scheme/:id", (req, res) => {
  const params = new URLSearchParams({
    id: req.params.id
  });

  if (req.query.lang) {
    params.set("lang", req.query.lang);
  }

  if (req.query.state) {
    params.set("state", req.query.state);
  }

  if (req.query.category) {
    params.set("category", req.query.category);
  }

  res.redirect(`/scheme-details.html?${params.toString()}`);
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "login.html"));
});

app.listen(PORT, async () => {
  try {
    const stats = await initializeRepository();
    console.log(`JanSevak running on port ${PORT}`);
    console.log(`Repository: ${stats.storage} | Schemes: ${stats.count}`);
  } catch (error) {
    console.error(`JanSevak started, but repository initialization failed: ${error.message}`);
    process.exitCode = 1;
  }
});
