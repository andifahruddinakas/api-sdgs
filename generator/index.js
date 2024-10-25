const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Fungsi untuk memeriksa cache desa
const checkCache = (desaCode) => {
  const cachePath = path.join(__dirname, "./data/cache_sdgs.json");
  if (fs.existsSync(cachePath)) {
    const cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    return cacheData.desa && cacheData.desa.includes(desaCode);
  }
  return false;
};

// Fungsi untuk memperbarui cache desa
const updateCache = (desaCode) => {
  const cachePath = path.join(__dirname, "./data/cache_sdgs.json");
  let cacheData = {};

  // Membaca data cache yang sudah ada
  if (fs.existsSync(cachePath)) {
    cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  }

  // Inisialisasi array desa jika belum ada
  if (!cacheData.desa) {
    cacheData.desa = [];
  }

  // Tambahkan kode desa ke cache jika belum ada
  if (!cacheData.desa.includes(desaCode)) {
    cacheData.desa.push(desaCode);
  }

  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
};

// Fungsi untuk menyimpan data desa sebagai JSON
const saveJsonData = (desaCode, data) => {
  const outputDir = path.join(__dirname, `./public/desa`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilePath = path.join(outputDir, `${desaCode}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
  console.log(
    `Data untuk desa ${desaCode} berhasil disimpan di ${outputFilePath}`
  );
};

// Fungsi untuk mengambil dan menyimpan data dari CSV
const fetchAndSaveDataFromCsv = async (csvFilePath) => {
  const csvData = fs.readFileSync(csvFilePath, "utf-8").split("\n").slice(1);

  for (const row of csvData) {
    const [locationCode] = row.split(",");

    if (checkCache(locationCode)) {
      console.log(
        `Data untuk desa ${locationCode} sudah ada di cache.`
      );
      continue;
    }

    try {
      const response = await axios.get(
        `https://sid.kemendesa.go.id/sdgs/searching/score-sdgs?location_code=${locationCode}`
      );

      // Cek status respons
      if (response.status !== 200) {
        console.log(`Status ` + response.status + ` untuk desa ${locationCode}.`);
        continue;
      }

      let scoreData = response.data;

      // Modifikasi data sesuai format yang diinginkan
      if (scoreData.data) {
        scoreData.data = scoreData.data.map((item) => ({
          goals: item.goals,
          title: item.title,
          image: item.image.split("/").pop(), // Mengambil nama file dari URL
          score: item.score,
        }));
      }

      saveJsonData(locationCode, scoreData);
      updateCache(locationCode);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log(`Error 500 untuk desa ${locationCode}.`);
      } else {
        console.error(`Error fetching data untuk desa ${locationCode}:`, error);
      }
    }
  }
};

// Fungsi untuk mengambil dan menyimpan data dari semua CSV di folder data
const fetchAndSaveAllData = async () => {
  const dataFolder = path.join(__dirname, "./data/");
  const files = fs.readdirSync(dataFolder);

  for (const file of files) {
    const filePath = path.join(dataFolder, file);
    if (
      file.endsWith(".csv") &&
      !["desa", "kabupaten.csv", "kecamatan.csv", "provinsi.csv"].includes(file)
    ) {
      console.log(`Mengambil data dari ${file}`);
      await fetchAndSaveDataFromCsv(filePath);
    }
  }
};

// Fungsi utama
const main = async () => {
  await fetchAndSaveAllData();
};

// Menjalankan fungsi utama
main();
