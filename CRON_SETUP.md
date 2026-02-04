# Cron Job Configuration

## Overview
Sistem ini dikonfigurasi untuk menjalankan generator otomatis setiap 1 bulan sekali menggunakan Vercel Crons feature.

## Cron Schedule
- **Path**: `/api/cron`
- **Schedule**: `0 0 1 * *` (Setiap hari 1 bulan pada jam 00:00 UTC)
  - Setiap bulan, pada tanggal 1, jam tengah malam UTC

## Setup di Vercel

### 1. Environment Variables
Set environment variables di Vercel Project Settings:

```env
CRON_SECRET=your-secure-secret-key
GENERATOR_SECRET=another-secure-key
```

### 2. Verifikasi Konfigurasi
File `vercel.json` sudah dikonfigurasi dengan:
- Route untuk `/api/cron` menuju `api/cron.js`
- Cron job schedule di bagian `"crons"`

### 3. Deployment
Cron job akan langsung aktif setelah deploy ke Vercel.

## Testing Cron Job

### Menggunakan Manual Trigger
```bash
curl -X POST http://localhost:5000/api/trigger-generator \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-generator-secret"}'
```

### Langsung Mengakses Endpoint Cron
```bash
curl http://localhost:5000/api/cron
```

## Monitoring

### Vercel Logs
1. Buka project di Vercel Dashboard
2. Pergi ke **Deployments** → pilih deployment → **Logs**
3. Cari output dari cron job yang berjalan
4. Log akan menampilkan:
   - `[CRON] Memulai generator...`
   - Proses generator
   - `[CRON] Generator selesai dalam XXXms`

### Status Response
**Success Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Generator berhasil dijalankan",
  "timestamp": "2025-02-04T00:00:00.000Z",
  "duration": "5234ms"
}
```

**Error Response:**
```json
{
  "status": 500,
  "error": true,
  "message": "Terjadi kesalahan saat menjalankan generator",
  "errorDetails": "Error message details"
}
```

## Keamanan

### CRON_SECRET
Jika `CRON_SECRET` diatur di environment, endpoint cron akan memerlukan autentikasi:
```
Authorization: Bearer your-secret-key
```

Jika tidak diatur, endpoint akan berjalan tanpa autentikasi (not recommended untuk production).

## Troubleshooting

### Cron tidak berjalan
1. Verifikasi `vercel.json` memiliki section `"crons"`
2. Pastikan environment variable `CRON_SECRET` tersedia jika diperlukan
3. Check Vercel logs untuk error messages

### Generator error
1. Pastikan dependencies di `generator/package.json` terinstall
2. Check file permissions untuk folder `public/desa`
3. Verifikasi API endpoints yang digunakan generator masih aktif

### Timeout
Jika generator memakan waktu lebih dari 30 detik (Vercel function timeout), pertimbangkan:
1. Optimize generator script
2. Split task ke beberapa batch
3. Gunakan queue system seperti Bull atau RabbitMQ

## Schedule Format (Cron Expression)
Format: `minute hour day month day-of-week`
- `0 0 1 * *` = Setiap bulan pada tanggal 1, jam 00:00
- `0 12 1 * *` = Setiap bulan pada tanggal 1, jam 12:00 (siang UTC)
- `0 0 * * 0` = Setiap minggu (Minggu jam 00:00)
- `0 0 * * 1` = Setiap hari Senin jam 00:00

[Cron Expression Generator](https://crontab.guru/)
