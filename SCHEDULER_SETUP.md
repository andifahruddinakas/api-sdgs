# Local Scheduler dengan node-cron

## Overview

Sistem ini mendukung 2 cara untuk menjalankan generator otomatis:

### 1. **Vercel Cron** (Production - Cloud)
- Berjalan di cloud Vercel
- Tidak perlu server Node.js running 24/7
- Gratis dan reliable
- Path: `/api/cron` dengan schedule `0 0 1 * *`
- File konfigurasi: `vercel.json` dan `api/cron.js`

### 2. **Local Scheduler dengan node-cron** (Development/Self-hosted)
- Berjalan di server Node.js lokal
- Server harus running 24/7
- Cocok untuk deployment di VPS/dedicated server
- File: `scheduler.js` dan `index-scheduler.js`

## Setup Local Scheduler

### Instalasi Dependencies

```bash
npm install
```

Ini akan menginstall `node-cron` dan dependencies lainnya.

### Menjalankan dengan Scheduler

```bash
# Option 1: Menggunakan npm script
npm run start:scheduler
# atau
npm run dev

# Option 2: Direct dengan node
node index-scheduler.js
```

### Menjalankan tanpa Scheduler (Plain API)

```bash
# Hanya server API
npm run start
# atau
node index.js
```

## Fitur Scheduler

### Cron Schedule
- **Waktu**: Setiap tanggal 1 bulan, jam 00:00 UTC
- **Expression**: `0 0 1 * *`

### Logging
- ✅ Timestamp untuk setiap eksekusi
- 📊 Menampilkan output generator (dengan smart truncate untuk output besar)
- ❌ Error handling yang jelas
- 📈 Progress tracking

### Output Contoh

```
======================================================================
[2025-02-01T00:00:00.000Z] 🚀 Menjalankan scheduled generation SDGs...
======================================================================
[GENERATOR] Starting generator from: /path/to/generator/index.js
[GENERATOR] Data untuk desa 1101010001 sudah ada di cache.
[GENERATOR] Data untuk desa 1101010002 sudah ada di cache.
... (1990 more lines) ...
[GENERATOR] Process exited with code 1
[GENERATOR] Processed 2000 lines of output
[2025-02-01T00:02:15.123Z] ✅ Scheduled generation selesai
======================================================================
```

## Manual Testing

### Trigger Generator via API

```bash
curl -X POST http://localhost:5000/api/trigger-generator \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-generator-secret"}'
```

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": 200,
  "message": "API is running",
  "timestamp": "2025-02-04T12:34:56.789Z",
  "scheduler": "enabled"
}
```

## Environment Variables

Opsional, dapat ditambahkan di `.env`:

```env
# Port untuk server
PORT=5000

# Secret untuk generator trigger
GENERATOR_SECRET=your-secure-secret-key

# Timezone (optional, default: UTC)
TZ=Asia/Jakarta
```

## File Structure

```
api-sdgs/
├── index.js                 # Plain API server (tanpa scheduler)
├── index-scheduler.js       # API server + local scheduler
├── scheduler.js             # Local scheduler logic (node-cron)
├── api/
│   └── cron.js             # Vercel cron endpoint
├── generator/
│   ├── index.js            # Generator script
│   ├── package.json
│   └── data/               # Data files
├── public/
│   ├── index.html          # Homepage
│   ├── desa/               # Generated data files
│   └── img/                # Images
└── vercel.json             # Vercel config (untuk cloud deployment)
```

## Perbandingan: Local Scheduler vs Vercel Cron

| Aspek | Local Scheduler | Vercel Cron |
|-------|-----------------|-------------|
| **Tempat Berjalan** | VPS / Server lokal | Cloud Vercel |
| **Server Node.js** | Harus 24/7 | Tidak perlu |
| **Setup** | Sederhana | Sangat mudah |
| **Monitoring** | Manual via logs | Vercel Dashboard |
| **Biaya** | VPS cost | Gratis (included) |
| **Timezone** | Server timezone | UTC |
| **Reliability** | Tergantung server | Vercel uptime |

## Troubleshooting

### Scheduler tidak berjalan

**Masalah**: Scheduler dimulai tapi tidak pernah execute
- ✅ Pastikan server running terus
- ✅ Check timezone server (`date` atau `timedatectl`)
- ✅ Cek logs untuk error messages

### Generator error saat scheduled run

**Masalah**: Manual trigger berhasil tapi scheduled fail
- ✅ Check permissions folder `public/desa`
- ✅ Verify API endpoints generator masih aktif
- ✅ Check disk space

### High CPU/Memory usage

**Masalah**: Server menggunakan banyak resources saat scheduled run
- ✅ Split generator ke batch kecil
- ✅ Optimize generator script
- ✅ Gunakan `ulimit` untuk limit process resources

## Best Practices

1. **Use Vercel Cron untuk Production Cloud**
   - Lebih reliable
   - Tidak perlu maintain server

2. **Use Local Scheduler untuk Development**
   - Testing lebih mudah
   - Real-time feedback

3. **Set proper timezone**
   - Jika di Indonesia, set `TZ=Asia/Jakarta`
   - Default UTC dapat membingungkan

4. **Monitor execution**
   - Save logs ke file
   - Set up log rotation
   - Use tools seperti PM2 untuk process management

5. **Error handling**
   - Implement retry logic jika perlu
   - Set up alerts/notifications untuk error

## PM2 Integration (Optional)

Untuk production-grade deployment dengan auto-restart:

```bash
# Install PM2
npm install -g pm2

# Start dengan PM2
pm2 start index-scheduler.js --name "api-sdgs"

# Set to auto-start on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

## Cron Expression Reference

Format: `minute hour day month day-of-week`

```
0 0 1 * *     = Setiap bulan tanggal 1, jam 00:00 UTC
0 0 * * 0     = Setiap hari Minggu, jam 00:00 UTC
0 0 * * 1-5   = Setiap hari kerja (Senin-Jumat), jam 00:00 UTC
0 */4 * * *   = Setiap 4 jam
0 0 1 0 *     = Setiap bulan tanggal 1 (alternative format)
```

[Cron Expression Generator](https://crontab.guru/)
