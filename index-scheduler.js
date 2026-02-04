const express = require("express");
const fs = require("fs");
const path = require("path");
const { startScheduler } = require("./scheduler");

const app = express();

app.use(express.json());

// Menyediakan akses ke folder `public` untuk file statis
app.use(express.static(path.join(__dirname, "public")));

// Menyediakan akses ke folder `public/img` untuk menampilkan gambar secara langsung
app.use("/img", express.static(path.join(__dirname, "img")));

// Root endpoint - melayani HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Manual trigger untuk menjalankan generator (untuk testing)
app.post("/api/trigger-generator", async (req, res) => {
  const { secret } = req.body;
  const triggerSecret = process.env.GENERATOR_SECRET || "your-secret-key";

  if (secret !== triggerSecret) {
    return res.status(401).json({
      status: 401,
      error: true,
      message: "Unauthorized",
    });
  }

  try {
    const cronHandler = require("./api/cron.js");
    await cronHandler(req, res);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: true,
      message: "Terjadi kesalahan",
      errorDetails: error.message,
    });
  }
});

// API endpoint - mengambil data desa berdasarkan kode
app.get("/api/:kodedesa", (req, res) => {
  const { kodedesa } = req.params;
  const filePath = path.join(__dirname, "public", "desa", `${kodedesa}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      status: 404,
      error: true,
      message: "ID Desa tidak ditemukan",
    });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return res.status(500).json({
        status: 500,
        error: true,
        message: "Terjadi kesalahan saat membaca file",
      });
    }

    try {
      const jsonData = JSON.parse(data);

      // Buat URL gambar dinamis sesuai server
      const hostUrl = `${req.protocol}://${req.headers.host}`;

      // Perbarui setiap elemen di `data` dengan `hostUrl` pada `image`
      jsonData.data = jsonData.data.map((item) => ({
        ...item,
        image: `${hostUrl}/img/${item.image}`,
      }));

      res.json(jsonData);
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
      res.status(500).json({
        status: 500,
        error: true,
        message: "File JSON tidak valid",
      });
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: 200,
    message: "API is running",
    timestamp: new Date().toISOString(),
    scheduler: "enabled",
  });
});

const PORT = process.env.PORT || 5000;

// Start scheduler sebelum start server
console.log("[STARTUP] Initializing API SDGs with Local Scheduler...\n");
startScheduler();

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] 🌐 API Server is running on port ${PORT}`);
  console.log(`[SERVER] 📍 Local: http://localhost:${PORT}`);
  console.log(`[SERVER] 🏠 Homepage: http://localhost:${PORT}/`);
  console.log(`[SERVER] 📚 API Docs: Check /api/[kode_desa] endpoint\n`);
});
