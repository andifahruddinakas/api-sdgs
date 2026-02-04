const cron = require("node-cron");
const path = require("path");
const { spawn } = require("child_process");

/**
 * Scheduler untuk otomatis generate data SDGs setiap bulan
 * Berjalan setiap tanggal 1 bulan pada jam 00:00 (UTC)
 *
 * Untuk development, bisa dijalankan dengan:
 * npm run start:scheduler
 * atau
 * npm run dev
 */

const startScheduler = () => {
  // Cron expression: "0 0 1 * *" = jam 00:00, tanggal 1, setiap bulan
  const task = cron.schedule("0 0 1 * *", async () => {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`[${new Date().toISOString()}] 🚀 Menjalankan scheduled generation SDGs...`);
    console.log("=".repeat(70));

    try {
      // Jalankan generator
      await runGenerator();

      console.log(`[${new Date().toISOString()}] ✅ Scheduled generation selesai`);
      console.log("=".repeat(70) + "\n");
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ Error dalam scheduled generation:`);
      console.error(error.message);
      console.log("=".repeat(70) + "\n");
    }
  });

  console.log("\n" + "=".repeat(70));
  console.log("[SCHEDULER] ✨ Local Scheduler telah diaktifkan");
  console.log("[SCHEDULER] Generator akan berjalan otomatis setiap tanggal 1 bulan jam 00:00 UTC");
  console.log(`[SCHEDULER] Waktu server saat ini: ${new Date().toLocaleString()}`);
  console.log("=".repeat(70) + "\n");

  return task;
};

/**
 * Menjalankan generator menggunakan child_process
 * @returns {Promise<void>}
 */
function runGenerator() {
  return new Promise((resolve, reject) => {
    const generatorPath = path.join(__dirname, "generator", "index.js");

    console.log(`[GENERATOR] Starting generator from: ${generatorPath}`);

    const child = spawn("node", [generatorPath], {
      cwd: path.join(__dirname, "generator"),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let lineCount = 0;

    child.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      lines.forEach((line) => {
        if (line.trim()) {
          lineCount++;
          // Hanya tampilkan 5 baris pertama dan 5 baris terakhir untuk menghindari spam
          if (lineCount <= 5 || lineCount > 1000) {
            console.log(`[GENERATOR] ${line}`);
          } else if (lineCount === 6) {
            console.log(`[GENERATOR] ... (${1000 - 10} more lines) ...`);
          }
        }
      });
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(`[GENERATOR ERROR] ${data}`);
    });

    child.on("close", (code) => {
      console.log(`[GENERATOR] Process exited with code ${code}`);
      console.log(`[GENERATOR] Processed ${lineCount} lines of output`);

      if (code === 0 || code === 1) {
        // Code 0 = sukses, Code 1 = selesai (mungkin dari generator script)
        resolve({
          code,
          stdout,
          stderr,
          linesProcessed: lineCount,
        });
      } else {
        reject(new Error(`Generator exited with code ${code}: ${stderr}`));
      }
    });

    child.on("error", (err) => {
      console.error(`[GENERATOR ERROR] Failed to start: ${err.message}`);
      reject(err);
    });
  });
}

module.exports = { startScheduler };
