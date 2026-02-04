/**
 * Cron Job untuk menjalankan generator setiap 1 bulan sekali
 * Dijalankan otomatis oleh Vercel pada waktu yang ditentukan
 */

const { spawn } = require("child_process");
const path = require("path");

module.exports = async (req, res) => {
  // Verifikasi bahwa request datang dari Vercel
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      status: 401,
      error: true,
      message: "Unauthorized",
    });
  }

  try {
    console.log("[CRON] Memulai generator...");
    const startTime = Date.now();

    // Jalankan generator
    await runGenerator();

    const duration = Date.now() - startTime;
    console.log(`[CRON] Generator selesai dalam ${duration}ms`);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Generator berhasil dijalankan",
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error("[CRON] Error:", error);
    res.status(500).json({
      status: 500,
      error: true,
      message: "Terjadi kesalahan saat menjalankan generator",
      errorDetails: error.message,
    });
  }
};

/**
 * Menjalankan generator menggunakan child_process
 * @returns {Promise<void>}
 */
function runGenerator() {
  return new Promise((resolve, reject) => {
    const generatorPath = path.join(__dirname, "..", "generator", "index.js");

    const child = spawn("node", [generatorPath], {
      cwd: path.join(__dirname, "..", "generator"),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log(`[GENERATOR OUTPUT] ${data}`);
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(`[GENERATOR ERROR] ${data}`);
    });

    child.on("close", (code) => {
      if (code === 0 || code === 1) {
        // Code 0 = sukses, Code 1 = selesai (mungkin dari generator script)
        resolve({
          code,
          stdout,
          stderr,
        });
      } else {
        reject(new Error(`Generator exited with code ${code}: ${stderr}`));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}
