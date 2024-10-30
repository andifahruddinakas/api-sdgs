const axios = require("axios");
const fs = require("fs");
const path = require("path");

const checkCache = (desaCode) => {
  const cachePath = path.join(__dirname, "./data/cache_sdgs.json");
  if (fs.existsSync(cachePath)) {
    const cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    return cacheData.desa && cacheData.desa.includes(desaCode);
  }
  return false;
};

const updateCache = (desaCode) => {
  const cachePath = path.join(__dirname, "./data/cache_sdgs.json");
  let cacheData = {};

  if (fs.existsSync(cachePath)) {
    cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  }

  if (!cacheData.desa) {
    cacheData.desa = [];
  }

  if (!cacheData.desa.includes(desaCode)) {
    cacheData.desa.push(desaCode);
  }

  fs.writeFileSync(cachePath, JSON.stringify(cacheData));
};

const saveJsonData = (desaCode, data) => {
  const outputDir = path.join(__dirname, "../public/desa");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilePath = path.join(outputDir, `${desaCode}.json`);

  fs.writeFileSync(outputFilePath, JSON.stringify(data));
  console.log(
    `Data untuk desa ${desaCode} berhasil disimpan.`
  );
};

const fetchAndSaveDataFromCsv = async (csvFilePath) => {
  const csvData = fs.readFileSync(csvFilePath, "utf-8").split("\n").slice(1);

  for (const row of csvData) {
    const [locationCode] = row.split(",");

    if (checkCache(locationCode)) {
      console.log(`Data untuk desa ${locationCode} sudah ada di cache.`);
      continue;
    }

    try {
      const response = await axios.get(
        `https://sid.kemendesa.go.id/sdgs/searching/score-sdgs?location_code=${locationCode}`
      );

      if (response.status !== 200) {
        console.log(`Status ${response.status} untuk desa ${locationCode}.`);
        continue;
      }

      let scoreData = response.data;

      if (scoreData.data) {
        scoreData.data = scoreData.data.map((item) => ({
          goals: item.goals,
          title: item.title,
          image: item.image.split("/").pop(),
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

const main = async () => {
  await fetchAndSaveAllData();
};

main();
