const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());

// Menyediakan akses ke folder `public/img` untuk menampilkan gambar secara langsung
app.use("/img", express.static(path.join(__dirname, "img")));

app.get("/", (req, res) => {
  res.send("Welcome to the API! Use /api/[kode_desa] to access data.");
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
